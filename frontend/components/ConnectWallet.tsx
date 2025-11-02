"use client";

import { useWallet } from '@/context/WalletContext';

export default function ConnectWallet() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  return (
    <button
      onClick={isConnected ? disconnectWallet : connectWallet}
      className="group relative px-6 py-2.5 font-semibold text-white transition-all duration-300 ease-out hover:scale-105"
    >
      <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></span>
      <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-full"></span>
      <span className="relative flex items-center gap-2 text-sm">
        {isConnected ? (
          <>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {address.slice(0, 6)}...{address.slice(-4)}
          </>
        ) : (
          'Connect Wallet'
        )}
      </span>
    </button>
  );
}
