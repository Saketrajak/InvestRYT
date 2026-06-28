"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  showNewResearch?: boolean;
  onNewResearch?: () => void;
}

export default function Header({ showNewResearch, onNewResearch }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-2xl shadow-sm">
      <div className="w-full max-w-[1520px] mx-auto px-8 lg:px-10 h-20 flex items-center justify-between">

        <div className="flex items-center shrink-0">
          <img src="/investryt.svg" alt="Investryt Logo" className="h-10 w-auto object-contain" />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Research</button>
          <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Features</button>
          <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Documentation</button>
          <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">API</button>
          <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">GitHub</button>
        </nav>

        <div className="flex items-center shrink-0">
          {showNewResearch ? (
            <button
              onClick={onNewResearch}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              <RefreshCw className="h-4 w-4" />
              New Research
            </button>
          ) : (
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              Start Researching &rarr;
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
