// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;
    
    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParams
    ) external view returns (uint nativeFee, uint zroFee);
}

interface ILayerZeroReceiver {
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external;
}

/**
 * @title CrossChainSwap
 * @notice Contract for handling cross-chain token swaps using LayerZero
 * @dev Enables token swaps across different blockchain networks
 */
contract CrossChainSwap is ILayerZeroReceiver {
    
    // Events
    event CrossChainSwapInitiated(
        address indexed user,
        address indexed token,
        uint256 amount,
        string sourceChain,
        string destinationChain,
        uint16 destinationChainId
    );
    
    event CrossChainSwapCompleted(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint16 sourceChainId
    );
    
    event CrossChainSwapFailed(
        address indexed user,
        address indexed token,
        uint256 amount,
        string reason
    );
    
    // State variables
    address public owner;
    ILayerZeroEndpoint public lzEndpoint;
    
    mapping(string => uint16) public chainNameToLzChainId; // chain name => LayerZero chain ID
    mapping(uint16 => address) public trustedRemotes; // LZ chain ID => remote contract address
    mapping(address => mapping(uint16 => uint256)) public pendingSwaps; // user => chainId => amount
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyLzEndpoint() {
        require(msg.sender == address(lzEndpoint), "Only LayerZero endpoint can call");
        _;
    }
    
    constructor(address _lzEndpoint) {
        require(_lzEndpoint != address(0), "Invalid LayerZero endpoint");
        owner = msg.sender;
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
    }
    
    /**
     * @notice Set LayerZero chain ID for a chain name
     * @param chainName Name of the chain (e.g., "ethereum", "polygon")
     * @param lzChainId LayerZero chain ID
     */
    function setChainId(string memory chainName, uint16 lzChainId) external onlyOwner {
        chainNameToLzChainId[chainName] = lzChainId;
    }
    
    /**
     * @notice Set trusted remote contract address for cross-chain communication
     * @param lzChainId LayerZero chain ID
     * @param remoteAddress Address of the contract on the remote chain
     */
    function setTrustedRemote(uint16 lzChainId, address remoteAddress) external onlyOwner {
        require(remoteAddress != address(0), "Invalid remote address");
        trustedRemotes[lzChainId] = remoteAddress;
    }
    
    /**
     * @notice Execute a cross-chain token swap
     * @param amount Amount of token to swap
     * @param token Address of the token to swap
     * @param sourceChain Name of the source chain
     * @param destinationChain Name of the destination chain
     * @return success Whether the swap initiation was successful
     */
    function executeCrossChainSwap(
        uint256 amount,
        address token,
        string memory sourceChain,
        string memory destinationChain
    ) external payable returns (bool success) {
        require(amount > 0, "Amount must be greater than 0");
        require(token != address(0), "Invalid token address");
        
        uint16 dstChainId = chainNameToLzChainId[destinationChain];
        require(dstChainId != 0, "Destination chain not configured");
        require(trustedRemotes[dstChainId] != address(0), "Remote contract not set");
        
        // Transfer tokens from user to contract
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Prepare payload for cross-chain message
        bytes memory payload = abi.encode(msg.sender, token, amount);
        
        // Prepare adapter params (default)
        bytes memory adapterParams = abi.encodePacked(uint16(1), uint256(200000));
        
        // Get the fees required
        (uint256 nativeFee,) = lzEndpoint.estimateFees(
            dstChainId,
            address(this),
            payload,
            false,
            adapterParams
        );
        
        require(msg.value >= nativeFee, "Insufficient fee provided");
        
        // Send cross-chain message
        try lzEndpoint.send{value: nativeFee}(
            dstChainId,
            abi.encodePacked(trustedRemotes[dstChainId], address(this)),
            payload,
            payable(msg.sender),
            address(0),
            adapterParams
        ) {
            pendingSwaps[msg.sender][dstChainId] += amount;
            
            emit CrossChainSwapInitiated(
                msg.sender,
                token,
                amount,
                sourceChain,
                destinationChain,
                dstChainId
            );
            
            // Refund excess fee
            if (msg.value > nativeFee) {
                (bool refundSuccess,) = msg.sender.call{value: msg.value - nativeFee}("");
                require(refundSuccess, "Refund failed");
            }
            
            return true;
        } catch Error(string memory reason) {
            // Return tokens to user on failure
            IERC20(token).transfer(msg.sender, amount);
            emit CrossChainSwapFailed(msg.sender, token, amount, reason);
            revert(string(abi.encodePacked("Cross-chain swap failed: ", reason)));
        } catch {
            // Return tokens to user on failure
            IERC20(token).transfer(msg.sender, amount);
            emit CrossChainSwapFailed(msg.sender, token, amount, "Unknown error");
            revert("Cross-chain swap failed with unknown error");
        }
    }
    
    /**
     * @notice Receive cross-chain message from LayerZero
     * @param _srcChainId Source chain ID
     * @param _srcAddress Source contract address
     * @param _nonce Message nonce
     * @param _payload Message payload
     */
    function lzReceive(
        uint16 _srcChainId,
        bytes calldata _srcAddress,
        uint64 _nonce,
        bytes calldata _payload
    ) external override onlyLzEndpoint {
        // Verify trusted remote
        address srcAddress;
        assembly {
            srcAddress := mload(add(_srcAddress, 20))
        }
        require(trustedRemotes[_srcChainId] == srcAddress, "Untrusted source");
        
        // Decode payload
        (address user, address token, uint256 amount) = abi.decode(_payload, (address, address, uint256));
        
        // Check contract has sufficient balance
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance >= amount, "Insufficient token balance in contract");
        
        // Transfer tokens to user on destination chain
        require(IERC20(token).transfer(user, amount), "Token transfer failed");
        
        // Update pending swaps
        if (pendingSwaps[user][_srcChainId] >= amount) {
            pendingSwaps[user][_srcChainId] -= amount;
        }
        
        emit CrossChainSwapCompleted(user, token, amount, _srcChainId);
    }
    
    /**
     * @notice Estimate the fee required for a cross-chain swap
     * @param destinationChain Name of the destination chain
     * @param token Token address
     * @param amount Amount to swap
     * @return nativeFee Fee in native token (e.g., ETH)
     */
    function estimateCrossChainFee(
        string memory destinationChain,
        address token,
        uint256 amount
    ) external view returns (uint256 nativeFee) {
        uint16 dstChainId = chainNameToLzChainId[destinationChain];
        require(dstChainId != 0, "Destination chain not configured");
        
        bytes memory payload = abi.encode(msg.sender, token, amount);
        bytes memory adapterParams = abi.encodePacked(uint16(1), uint256(200000));
        
        (nativeFee,) = lzEndpoint.estimateFees(
            dstChainId,
            address(this),
            payload,
            false,
            adapterParams
        );
        
        return nativeFee;
    }
    
    /**
     * @notice Get pending swap amount for a user on a destination chain
     * @param user User address
     * @param destinationChain Destination chain name
     * @return amount Pending swap amount
     */
    function getPendingSwap(address user, string memory destinationChain) external view returns (uint256 amount) {
        uint16 dstChainId = chainNameToLzChainId[destinationChain];
        return pendingSwaps[user][dstChainId];
    }
    
    /**
     * @notice Fund the contract with tokens for cross-chain swaps (owner only)
     * @param token Token address to fund
     * @param amount Amount to deposit
     */
    function fundContract(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
    }
    
    /**
     * @notice Check contract balance for a token
     * @param token Token address
     * @return balance Contract's token balance
     */
    function getContractBalance(address token) external view returns (uint256 balance) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Emergency withdraw function for owner
     * @param token Token address to withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        require(IERC20(token).transfer(owner, balance), "Withdrawal failed");
    }
    
    /**
     * @notice Withdraw native tokens (for fees) - owner only
     */
    function withdrawNative() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success,) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    receive() external payable {}
}
