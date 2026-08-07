"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  showNewResearch?: boolean;
  onNewResearch?: () => void;
}

export default function Header({ showNewResearch, onNewResearch }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-md select-none shrink-0">
      <div className="w-full max-w-[1500px] mx-auto px-[40px] h-[80px] grid grid-cols-3 items-center">
        
        {/* Left: Logo */}
        <div className="flex justify-start">
          <img src="/investryt.svg" alt="Investryt Logo" className="h-[36px] w-auto object-contain cursor-pointer" onClick={() => window.location.href = '/'} />
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex justify-center items-center gap-[32px]">
          <button className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200">Research</button>
          <button className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200">Features</button>
          <button className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200">Documentation</button>
          <button className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200">API</button>
          <button className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200">GitHub</button>
        </nav>

        {/* Right: Action Button */}
        <div className="flex justify-end">
          {showNewResearch ? (
            <button
              onClick={onNewResearch}
              className="flex items-center gap-[8px] h-[44px] px-[20px] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-[12px] text-[12px] font-bold uppercase tracking-widest transition-all duration-300 shadow-md shadow-purple-500/10 cursor-pointer"
            >
              <RefreshCw className="h-[14px] w-[14px]" />
              <span>New Research</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="flex items-center gap-[8px] h-[44px] px-[24px] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-[12px] text-[12px] font-bold uppercase tracking-widest transition-all duration-300 shadow-md shadow-purple-500/10 cursor-pointer"
            >
              <span>Start Researching &rarr;</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
