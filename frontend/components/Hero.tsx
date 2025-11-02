"use client";

import Spline from '@splinetool/react-spline';
import { useWallet } from '@/context/WalletContext';
import { useState } from 'react';

export default function Hero() {
  const { isConnected, connectWallet } = useWallet();
  const [showMessage, setShowMessage] = useState(false);

  const handleStartSwapping = async () => {
    if (!isConnected) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      return;
    }
    // If connected, redirect to Telegram bot
    window.open('https://t.me/Treth11_bot', '_blank');
  };

  return (
    <section className="hero-section">
      <div className="spline-background">
        <Spline scene="https://prod.spline.design/kMT5N1lSushR4Q9Z/scene.splinecode" />
      </div>
      
      <div className="overlay"></div>
      
      <div className="hero-content">
        <div className="content-wrapper">
          <h1 className="hero-title">
            Swap Across Chains with <span className="gradient-text">Telegram</span>
          </h1>
          
          <p className="hero-description">
            Execute cross-chain and on-chain swaps using simple commands. No complex interfaces, just message the bot and swap instantly.
          </p>
          
          {showMessage && (
            <div className="wallet-warning">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Please connect your wallet first!
            </div>
          )}
          
          <div className="button-group">
            {!isConnected ? (
              <>
                <button
                  onClick={connectWallet}
                  className="primary-button"
                >
                  <span className="button-glow"></span>
                  <span className="button-bg"></span>
                  <span className="button-text">
                    Connect Wallet to Start
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartSwapping}
                className="primary-button"
              >
                <span className="button-glow"></span>
                <span className="button-bg"></span>
                <span className="button-text">
                  Start Swapping
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            )}
            <a href="#features" className="secondary-button">
              Learn How It Works
            </a>
          </div>
        </div>
        
        <div className="scroll-indicator">
          <div className="scroll-box">
            <div className="scroll-dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
