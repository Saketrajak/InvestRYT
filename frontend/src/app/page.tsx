"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import SearchHero from './components/SearchHero';
import Header from './components/Header';

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none z-0" />

      <div className="fixed inset-0 pointer-events-none flex justify-center z-40">
        <div className="w-full max-w-[1400px] h-full border-l border-r border-zinc-700/60" />
      </div>

      <Header />

      <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
        <SearchHero onSearch={handleSearch} />
      </main>

      <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4 z-20 relative">
        <div>
          &copy; 2026 Investryt AI. All rights reserved. Developed for InsideIIM &times; Altuni AI Labs.
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Powered by Gemini 2.5 &amp; Tavily Search Engines
        </div>
      </footer>
    </div>
  );
}
