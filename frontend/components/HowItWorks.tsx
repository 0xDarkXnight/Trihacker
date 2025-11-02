"use client";

import { useEffect, useRef } from 'react';

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

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
  const steps = [
    {
      step: "01",
      title: "Connect Your Wallet",
      description: "Link your Web3 wallet and authenticate with the Telegram bot to get started.",
      command: null
    },
    {
      step: "02",
      title: "Send a Command",
      description: "Use natural language to tell the bot what tokens you want to swap.",
      command: '"Swap 0.1 ETH to USDC on Ethereum"'
    },
    {
      step: "03",
      title: "Swap Executes",
      description: "The bot processes your command and executes the swap across chains or on-chain.",
      command: null
    },
    {
      step: "04",
      title: "Get Confirmation",
      description: "Receive instant confirmation with transaction hash and swap details.",
      command: null
    }
  ];

  return (
    <section ref={sectionRef} id="how-it-works" className="relative py-24 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4 scroll-reveal">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start swapping in four simple steps
          </p>
        </div>
        
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/0 via-purple-500 to-purple-500/0"></div>
          
          <div className="space-y-12">
            {steps.map((item, index) => (
              <div
                key={index}
                className={`scroll-reveal relative flex flex-col lg:flex-row gap-8 items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Content Card */}
                <div className="flex-1 w-full">
                  <div className="p-8 rounded-2xl bg-gray-900/80 border-2 border-purple-500/30 hover:border-purple-500/60 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="flex items-start gap-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                        {item.step}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 mb-4">
                          {item.description}
                        </p>
                        {item.command && (
                          <div className="p-4 rounded-lg bg-black/70 border border-purple-500/20">
                            <code className="text-sm text-green-400 font-mono">
                              {item.command}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Center Circle */}
                <div className="hidden lg:block relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"></div>
                    </div>
                  </div>
                </div>
                
                {/* Spacer */}
                <div className="flex-1 hidden lg:block"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
