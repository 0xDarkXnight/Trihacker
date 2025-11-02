"use client";

import { useEffect, useRef, useState } from 'react';

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = sectionRef.current?.querySelectorAll('.feature-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: "from-pink-500 to-rose-600",
      hoverBgColor: "rgba(236, 72, 153, 0.2)",
      title: "Cross-Chain Swaps",
      description: "Seamlessly swap tokens across different blockchain networks with a single command via Telegram."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "from-emerald-500 to-teal-600",
      hoverBgColor: "rgba(16, 185, 129, 0.2)",
      title: "On-Chain Swaps",
      description: "Execute fast on-chain token swaps within the same blockchain with instant confirmations and transaction hashes."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "from-sky-500 to-blue-600",
      hoverBgColor: "rgba(14, 165, 233, 0.2)",
      title: "Real-Time Alerts",
      description: "Get instant notifications on Telegram for swap confirmations, price updates, and transaction status."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      iconBg: "from-purple-500 to-violet-600",
      hoverBgColor: "rgba(168, 85, 247, 0.2)",
      title: "Instant Execution",
      description: "Lightning-fast swap execution with immediate Telegram confirmations and transaction updates."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconBg: "from-orange-500 to-amber-600",
      hoverBgColor: "rgba(249, 115, 22, 0.2)",
      title: "Full Analytics",
      description: "Track your swap history with detailed analytics across all chains and comprehensive transaction records."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: "from-indigo-500 to-blue-600",
      hoverBgColor: "rgba(99, 102, 241, 0.2)",
      title: "AI-Powered",
      description: "Natural language processing understands your swap commands in plain English for seamless transactions."
    }
  ];

  return (
    <section ref={sectionRef} id="features" className="relative py-24 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Powerful swap features designed for seamless cross-chain and on-chain transactions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={index}
                className="feature-card opacity-0 translate-y-10"
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="card-content p-6 rounded-3xl border border-gray-800 backdrop-blur-sm transition-all duration-500"
                  style={{
                    backgroundColor: isHovered ? feature.hoverBgColor : 'rgba(17, 24, 39, 0.5)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    borderColor: isHovered ? '#4b5563' : '#1f2937'
                  }}
                >
                  <div 
                    className={`icon-box w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-4 text-white transition-transform duration-300`}
                    style={{
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    {feature.icon}
                  </div>
                  
                  <h3 className="card-title text-xl font-bold text-white mb-2 font-mono">
                    {feature.title}
                  </h3>
                  
                  <p className="card-description text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
