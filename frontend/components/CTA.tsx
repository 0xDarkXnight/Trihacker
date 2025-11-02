"use client";

import { useEffect, useRef } from 'react';
import { useWallet } from '@/context/WalletContext';

export default function CTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const { isConnected, connectWallet } = useWallet();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleBotAccess = async () => {
    if (!isConnected) {
      // Trigger wallet connection popup
      await connectWallet();
      return;
    }
    // If already connected, open Telegram bot
    window.open('https://t.me/Treth11_bot', '_blank');
  };

  return (
    <section ref={sectionRef} className="relative py-24 px-4 bg-gradient-to-b from-black via-purple-900/20 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="space-y-8 scroll-reveal">
          <h2 className="text-4xl md:text-6xl font-bold text-white">
            Ready to Start Swapping?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of users using AI-powered Telegram bot for seamless cross-chain and on-chain swaps
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-6">
            <button
              onClick={handleBotAccess}
              className="group relative px-8 py-4 font-bold text-lg text-white transition-all duration-300 ease-out hover:scale-105 cursor-pointer"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity"></span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-full"></span>
              <span className="relative flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.99-1.73 6.66-2.87 8-3.43 3.8-1.58 4.59-1.85 5.11-1.86.11 0 .37.03.54.17.14.11.18.26.2.37.01.06.03.24.01.38z"/>
                </svg>
                {isConnected ? 'Open Telegram Bot' : 'Connect Wallet to Access'}
              </span>
            </button>
            
            <a
              href="#features"
              className="px-8 py-4 font-bold text-lg text-white border-2 border-purple-500/40 rounded-full backdrop-blur-sm hover:bg-purple-500/20 hover:border-purple-400/60 transition-all duration-300"
            >
              View Documentation
            </a>
          </div>
          
          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto scroll-reveal" style={{ transitionDelay: '200ms' }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-2">
                10k+
              </div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                $50M+
              </div>
              <div className="text-gray-400">Volume Traded</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
                99.9%
              </div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
