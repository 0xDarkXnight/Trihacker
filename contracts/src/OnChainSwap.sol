// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

/**
 * @title OnChainSwap
 * @notice Contract for handling same-chain token swaps
 * @dev Integrates with Uniswap V2 style DEX routers for token swaps
 */
contract OnChainSwap {
    
    // Events
    event SwapExecuted(
        address indexed user,
        address indexed sourceToken,
        address indexed destinationToken,
        uint256 amountIn,
        uint256 amountOut,
        string chain
    );
    
    event SwapFailed(
        address indexed user,
        address indexed sourceToken,
        address indexed destinationToken,
        uint256 amount,
        string reason
    );
    
    // State variables
    address public owner;
    mapping(string => address) public chainRouters; // chain name => router address
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Set the DEX router address for a specific chain
     * @param chainName Name of the chain (e.g., "ethereum", "polygon")
     * @param routerAddress Address of the Uniswap V2 style router
     */
    function setChainRouter(string memory chainName, address routerAddress) external onlyOwner {
        require(routerAddress != address(0), "Invalid router address");
        chainRouters[chainName] = routerAddress;
    }
    
    /**
     * @notice Execute a token swap on the same chain
     * @param amount Amount of source token to swap
     * @param sourceToken Address of the token being swapped
     * @param destinationToken Address of the token to receive
     * @param chain Name of the chain where swap is happening
     * @param minAmountOut Minimum amount of destination token to receive (slippage protection)
     * @return amountOut Amount of destination token received
     */
    function executeSwap(
        uint256 amount,
        address sourceToken,
        address destinationToken,
        string memory chain,
        uint256 minAmountOut
    ) external returns (uint256 amountOut) {
        require(amount > 0, "Amount must be greater than 0");
        require(sourceToken != address(0), "Invalid source token");
        require(destinationToken != address(0), "Invalid destination token");
        require(sourceToken != destinationToken, "Source and destination tokens must be different");
        
        address routerAddress = chainRouters[chain];
        require(routerAddress != address(0), "Router not set for this chain");
        
        // Transfer source tokens from user to contract
        require(
            IERC20(sourceToken).transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Approve router to spend source tokens
        require(
            IERC20(sourceToken).approve(routerAddress, amount),
            "Token approval failed"
        );
        
        // Prepare swap path
        address[] memory path = new address[](2);
        path[0] = sourceToken;
        path[1] = destinationToken;
        
        // Execute swap
        try IUniswapV2Router(routerAddress).swapExactTokensForTokens(
            amount,
            minAmountOut,
            path,
            msg.sender,
            block.timestamp + 300 // 5 minutes deadline
        ) returns (uint[] memory amounts) {
            amountOut = amounts[amounts.length - 1];
            
            emit SwapExecuted(
                msg.sender,
                sourceToken,
                destinationToken,
                amount,
                amountOut,
                chain
            );
            
            return amountOut;
        } catch Error(string memory reason) {
            emit SwapFailed(msg.sender, sourceToken, destinationToken, amount, reason);
            revert(string(abi.encodePacked("Swap failed: ", reason)));
        } catch {
            emit SwapFailed(msg.sender, sourceToken, destinationToken, amount, "Unknown error");
            revert("Swap failed with unknown error");
        }
    }
    
    /**
     * @notice Get estimated output amount for a swap
     * @param amount Amount of source token
     * @param sourceToken Address of source token
     * @param destinationToken Address of destination token
     * @param chain Chain name
     * @return estimatedAmount Estimated amount of destination token
     */
    function getEstimatedOutput(
        uint256 amount,
        address sourceToken,
        address destinationToken,
        string memory chain
    ) external view returns (uint256 estimatedAmount) {
        address routerAddress = chainRouters[chain];
        require(routerAddress != address(0), "Router not set for this chain");
        
        address[] memory path = new address[](2);
        path[0] = sourceToken;
        path[1] = destinationToken;
        
        uint[] memory amounts = IUniswapV2Router(routerAddress).getAmountsOut(amount, path);
        return amounts[amounts.length - 1];
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
}
