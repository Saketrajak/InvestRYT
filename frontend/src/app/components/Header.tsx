"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  showNewResearch?: boolean;
  onNewResearch?: () => void;
}

export default function Header({ showNewResearch, onNewResearch }: HeaderProps) {
  const pathname = usePathname();
  const navItems = [
    { name: 'Research', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'Documentation', href: '/documentation' },
    { name: 'API', href: '/api' },
    { name: 'GitHub', href: 'https://github.com/Saketrajak/InvestRYT', external: true }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-md select-none shrink-0">
      <div className="site-container h-[72px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Link href="/">
            <img src="/investryt.svg" alt="Investryt Logo" className="h-[36px] w-auto object-contain cursor-pointer" />
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-zinc-400 hover:text-white transition-colors duration-200 py-1"
                >
                  {item.name}
                </a>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-[14px] font-semibold transition-colors duration-200 py-1 relative ${
                  isActive ? 'text-teal-400' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-[-6px] left-0 right-0 h-[2px] bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                )}
              </Link>
            );
          })}
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
