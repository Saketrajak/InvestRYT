"use client";

// ============================================================
// Investryt AI — Premium Landing Page Hero
// ============================================================

import React, { useState } from 'react';
import { Search, ShieldAlert, Cpu } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

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
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 relative overflow-hidden max-w-4xl mx-auto">
      {/* Dynamic Animated AI Orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-teal-500/20 via-amber-500/10 to-transparent rounded-full filter blur-[80px] animate-pulse pointer-events-none" />
      <div className="relative mb-4 flex items-center justify-center w-20 h-20 bg-[#141416] border border-[#232326] rounded-2xl shadow-xl shadow-teal-950/20">
        <Cpu className="h-10 w-10 text-teal-400 animate-spin-slow" />
        <div className="absolute inset-0 border border-teal-500/20 rounded-2xl animate-ping opacity-25" />
      </div>

      {/* Main Titles */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent mb-4">
        Investryt <span className="text-teal-400">AI</span>
      </h1>
      <p className="text-lg md:text-xl text-zinc-400 font-light max-w-xl mx-auto mb-10 leading-relaxed">
        The Agentic Investment Research Terminal. Enter any global company to generate institutional-grade equity research reports instantly.
      </p>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative mb-8 z-10">
        <div className="relative flex items-center bg-[#141416] border border-[#232326] hover:border-teal-500/50 focus-within:border-teal-400 rounded-2xl p-1.5 shadow-2xl transition-all duration-300">
          <Search className="h-6 w-6 text-zinc-500 ml-4 shrink-0" />
          <input
            type="text"
            placeholder="Search company name, ticker or code (e.g., Apple, RELIANCE.NS, Samsung)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white placeholder-zinc-500 font-light px-4 py-3 text-base"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-xl transition-all text-sm uppercase tracking-wider shrink-0"
          >
            Research
          </button>
        </div>
      </form>

      {/* Suggestions */}
      <div className="flex flex-col items-center gap-3 z-10">
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Suggested Lookups</span>
        <div className="flex flex-wrap justify-center gap-2 max-w-xl">
          {suggestions.map((item) => (
            <button
              key={item.query}
              onClick={() => !loading && onSearch(item.query)}
              className="px-3.5 py-1.5 bg-[#141416]/80 hover:bg-[#1b1b1e] border border-[#232326] hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
            >
              {item.label} ({item.query})
            </button>
          ))}
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
