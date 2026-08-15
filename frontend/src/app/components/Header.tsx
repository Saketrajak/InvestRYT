"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface HeaderProps {
  showNewResearch?: boolean;
  onNewResearch?: () => void;
}

export default function Header({ showNewResearch, onNewResearch }: HeaderProps) {
  const navItems = ['Research', 'Features', 'Documentation', 'API', 'GitHub'];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-md select-none shrink-0">
      <div className="w-full max-w-[1500px] mx-auto px-[40px] h-[80px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <img src="/investryt.svg" alt="Investryt Logo" className="h-[36px] w-auto object-contain cursor-pointer" onClick={() => window.location.href = '/'} />
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
            <button
              key={item}
              className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200 py-2"
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right: Action Button */}
        <div className="flex items-center shrink-0">
          {showNewResearch ? (
            <button onClick={onNewResearch} className="btn-primary">
              <RefreshCw className="h-[14px] w-[14px]" />
              <span>New Research</span>
            </button>
          ) : (
            <button
              onClick={() => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              className="btn-primary"
            >
              <span>Start Researching &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
