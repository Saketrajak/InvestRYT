"use client";

// ============================================================
// Investryt AI — Premium Landing Page Hero
// ============================================================

import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu } from 'lucide-react';
import { ThreeDMarquee } from '@/components/ui/3d-marquee';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

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
  "/1.png?v=2", "/2.png?v=2", "/4.png?v=2", "/5.png?v=2", "/6.png?v=2",
  "/2.png?v=2", "/5.png?v=2", "/1.png?v=2", "/6.png?v=2", "/4.png?v=2",
  "/5.png?v=2", "/6.png?v=2", "/2.png?v=2", "/4.png?v=2", "/1.png?v=2",
  "/6.png?v=2", "/4.png?v=2", "/5.png?v=2", "/1.png?v=2", "/2.png?v=2",
  "/4.png?v=2", "/1.png?v=2", "/6.png?v=2", "/2.png?v=2", "/5.png?v=2",
  
  "/1.png?v=2", "/2.png?v=2", "/4.png?v=2", "/5.png?v=2", "/6.png?v=2",
  "/2.png?v=2", "/5.png?v=2", "/1.png?v=2", "/6.png?v=2", "/4.png?v=2",
  "/5.png?v=2", "/6.png?v=2", "/2.png?v=2", "/4.png?v=2", "/1.png?v=2",
  "/6.png?v=2", "/4.png?v=2", "/5.png?v=2", "/1.png?v=2", "/2.png?v=2",
  "/4.png?v=2", "/1.png?v=2", "/6.png?v=2", "/2.png?v=2", "/5.png?v=2",
  
  "/1.png?v=2", "/2.png?v=2", "/4.png?v=2", "/5.png?v=2", "/6.png?v=2",
  "/2.png?v=2", "/5.png?v=2", "/1.png?v=2", "/6.png?v=2", "/4.png?v=2",
  "/5.png?v=2", "/6.png?v=2", "/2.png?v=2", "/4.png?v=2", "/1.png?v=2",
  "/6.png?v=2", "/4.png?v=2", "/5.png?v=2", "/1.png?v=2", "/2.png?v=2",
  "/4.png?v=2", "/1.png?v=2", "/6.png?v=2", "/2.png?v=2", "/5.png?v=2",
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
      <div className="absolute inset-0 z-0 opacity-100 w-full h-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(9,9,11,0.98)_0%,rgba(9,9,11,0.8)_45%,rgba(9,9,11,0.1)_100%)] z-10 pointer-events-none" />
        <ThreeDMarquee images={marqueeImages} className="w-full h-full max-w-none" />
      </div>

      <div className="relative z-10 max-w-[1150px] w-full mx-auto flex flex-col items-start pt-24 pb-12 px-6 pointer-events-none">
        <div className="w-full flex flex-col items-start">

          {/* Badge */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 mb-12 pointer-events-auto">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-semibold tracking-widest text-zinc-300 uppercase">
              AI-Powered Investment Research
            </span>
          </div>

          {/* Main Titles */}
          <h1 className="text-left text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-white pointer-events-auto">
            AI that researches. <br />
            Insights that <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-pulse">compound.</span>
          </h1>

          <p className="text-left text-lg md:text-xl text-zinc-400 max-w-2xl font-light mb-16 pointer-events-auto">
            The agentic investment research terminal that analyzes companies, financials, news, and sentiment to deliver institutional-grade equity research in seconds.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group mb-12 z-10 pointer-events-auto">
            <Field className="w-full relative gap-4">
              <FieldLabel htmlFor="input-button-group" className="text-zinc-500 font-bold uppercase tracking-wider ml-1 text-sm">Search</FieldLabel>

              <div className="absolute top-10 inset-x-0 bottom-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl blur-xl transition-all opacity-0 group-hover:opacity-100" />

              <ButtonGroup className="relative bg-[#09090b]/80 backdrop-blur-xl border border-[#232326] rounded-xl transition-all group-hover:border-purple-500/50 focus-within:border-purple-500/50 shadow-2xl p-1">
                <div className="flex items-center pl-3">
                  <Search className="h-5 w-5 text-zinc-500" />
                </div>
                <Input
                  id="input-button-group"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search company name, ticker or code (e.g., Apple, RELIANCE.NS, Samsung)"
                  className="flex-1 border-none bg-transparent h-12 text-base text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-0 shadow-none"
                  disabled={loading}
                />
                <Button
                  variant="outline"
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="h-10 px-6 rounded-lg bg-purple-600/10 hover:bg-purple-600/20 border-purple-500/30 text-purple-400 font-semibold uppercase tracking-wider transition-all disabled:opacity-50 ml-1"
                >
                  Research
                </Button>
              </ButtonGroup>
            </Field>
          </form>

          {/* Suggestions */}
          <div className="flex flex-col items-start gap-6 z-10 w-full max-w-3xl pointer-events-auto">
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
      <div className="w-full absolute bottom-0 z-10 border-t border-b border-zinc-700/60 flex justify-center bg-transparent">
        <div className="w-full max-w-[1400px] bg-white overflow-hidden py-10 min-h-[80px] flex items-center justify-center">
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
