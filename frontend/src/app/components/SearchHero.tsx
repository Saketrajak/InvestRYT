"use client";

// ============================================================
// Investryt AI — Premium Landing Page Hero
// ============================================================

import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu } from 'lucide-react';
import { ThreeDMarquee } from '@/components/ui/3d-marquee';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

const companies = [
  { src: '/openai.svg', alt: 'OpenAI' },
  { src: '/amazon.svg', alt: 'Amazon' },
  { src: '/nvidia.svg', alt: 'Nvidia' },
  { src: '/ford.svg', alt: 'Ford' },
  { src: '/coinbase.svg', alt: 'Coinbase' },
  { src: '/google.svg', alt: 'Google' },
  { src: '/shopify.svg', alt: 'Shopify' },
  { src: '/mindbody.svg', alt: 'Mindbody' },
  { src: '/uber.svg', alt: 'Uber' },
  { src: '/anthropic.svg', alt: 'Anthropic' },
  { src: '/cursor.svg', alt: 'Cursor' },
  { src: '/lightspeed.svg', alt: 'Lightspeed' },
  { src: '/marriott.svg', alt: 'Marriott' },
  { src: '/metlife.svg', alt: 'Metlife' },
  { src: '/ramp.svg', alt: 'Ramp' },
  { src: '/woocommerce.svg', alt: 'WooCommerce' },
];

const marqueeImages = [
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
  "/ChatGPT Image Jun 26, 2026, 02_17_25 PM.png",
];

export default function SearchHero({ onSearch, loading }: SearchHeroProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSearch(query.trim());
    }
  };

  const suggestions = [
    { label: 'Apple Inc.', query: 'AAPL' },
    { label: 'Reliance Industries', query: 'RELIANCE.NS' },
    { label: 'Nvidia Corp.', query: 'NVDA' },
    { label: 'Samsung Electronics', query: '005930.KS' },
    { label: 'Tesla Inc.', query: 'TSLA' },
  ];

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full h-full text-center px-0 relative overflow-hidden max-w-full mx-auto">

      {/* 3D Marquee Background Layer */}
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] z-10" />
        <ThreeDMarquee images={marqueeImages} className="w-full h-full max-w-none" />
      </div>
      
      <div className="relative z-10 max-w-[1400px] w-full mx-auto flex flex-col items-start pt-24 pb-12 px-8">
        <div className="w-full pl-8 flex flex-col items-start">
        
        {/* Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-8">
          <Cpu className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase">
            AI-Powered Investment Research
          </span>
        </div>

        {/* Main Titles */}
        <h1 className="scroll-m-20 text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] text-left">
          AI that researches.<br />
          Insights that <span className="bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">compound.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 font-normal max-w-2xl mb-12 leading-relaxed text-left">
          The agentic investment research terminal that analyzes companies, financials, news, and sentiment to deliver institutional-grade equity research in seconds.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl relative mb-8 z-10">
          <div className="relative flex items-center bg-[#09090b]/80 backdrop-blur-md border border-purple-500/30 rounded-xl p-1 shadow-2xl transition-all duration-300 focus-within:border-purple-400/60">
            <Search className="h-6 w-6 text-zinc-500 ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search company name, ticker or code (e.g., Apple, RELIANCE.NS, Samsung)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
              className="w-full bg-transparent border-0 outline-none focus:ring-0 text-zinc-200 placeholder-zinc-500 font-light px-4 py-3.5 text-base"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-transparent border border-purple-500/40 hover:bg-purple-500/10 disabled:border-zinc-800 disabled:text-zinc-600 text-purple-400 font-medium rounded-lg transition-all text-sm uppercase tracking-wider shrink-0 mr-1"
            >
              Research
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="flex flex-col items-start gap-4 z-10 w-full max-w-3xl">
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Suggested Lookups</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
            {suggestions.map((item, index) => (
              <React.Fragment key={item.query}>
                <button
                  onClick={() => !loading && onSearch(item.query)}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </button>
                {index < suggestions.length - 1 && (
                  <span className="text-zinc-700">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Company Logos Marquee */}
      <div className="w-full max-w-[1400px] px-8 absolute bottom-8 z-10 left-1/2 -translate-x-1/2">
        <div className="w-full bg-white rounded-[32px] overflow-hidden py-8 shadow-2xl shadow-black/50 border border-white/10">
          <InfiniteMovingCards items={companies} direction="right" speed="slow" pauseOnHover={false} />
        </div>
      </div>

      {/* Style Animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
