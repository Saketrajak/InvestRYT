"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { 
  BookOpen, Terminal, Code, Settings, 
  ChevronRight, ArrowRight, Shield, Zap, Sparkles
} from 'lucide-react';

const docSections = [
  {
    id: 'intro',
    title: '1. Introduction',
    icon: BookOpen,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300 font-light leading-relaxed">
          Investryt AI is an institutional-grade investment research assistant designed to automate fundamental analysis on public equities. It utilizes an advanced multi-agent LangGraph system to scrape, evaluate, cross-examine, and render qualitative and quantitative reports.
        </p>
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 flex gap-3 text-sm text-zinc-400 font-light leading-relaxed">
          <Sparkles className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
          <span>
            <strong>Agentic Philosophy:</strong> Rather than relying on simple prompt engineering, Investryt implements a state graph where specialized agents are given unique nodes (e.g. Profiler, Moat Scanner, Statement Parser) and pass validated payloads across state transitions.
          </span>
        </div>
      </div>
    )
  },
  {
    id: 'architecture',
    title: '2. Multi-Agent Architecture',
    icon: Terminal,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300 font-light leading-relaxed">
          Investryt compiles fundamental data in 7 sequential steps. The state schema is shared and mutated through LangGraph state transitions:
        </p>
        <div className="border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs text-zinc-400">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-zinc-300 font-semibold flex items-center justify-between">
            <span>LangGraph State Graph definition</span>
            <span className="text-teal-400">graph.ts</span>
          </div>
          <div className="p-4 bg-zinc-950/40 space-y-1.5 overflow-x-auto">
            <div>const workflow = new StateGraph&lt;GraphState&gt;()</div>
            <div className="pl-4">.addNode("resolve", resolveCompanyNode)</div>
            <div className="pl-4">.addNode("profile", profileCompanyNode)</div>
            <div className="pl-4">.addNode("financials", extractFinancialsNode)</div>
            <div className="pl-4">.addNode("metrics", calculateMetricsNode)</div>
            <div className="pl-4">.addNode("moat", scanCompetitiveMoatsNode)</div>
            <div className="pl-4">.addNode("sentiment", analyzeNewsSentimentNode)</div>
            <div className="pl-4">.addNode("valuation", generateValuationModelNode);</div>
            <div className="pt-2">workflow.addEdge("__start__", "resolve");</div>
            <div>workflow.addEdge("resolve", "profile");</div>
            <div>workflow.addEdge("profile", "financials");</div>
            <div>...</div>
          </div>
        </div>
        <p className="text-zinc-400 text-xs font-light leading-relaxed">
          Each node is fully sandboxed, ensuring that a transient API rate limit in the News node, for instance, triggers safe fallbacks rather than breaking the full pipeline.
        </p>
      </div>
    )
  },
  {
    id: 'scoring',
    title: '3. Valuation & Scoring Matrix',
    icon: Shield,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300 font-light leading-relaxed">
          The agent evaluates equities using a dual-faceted matrix. The recommendation (INVEST, PASS, HOLD) is computed through the following weights:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Quantitative Factors (60%)
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4 font-light">
              <li>Gross Margin consistency (&gt;40% preferred)</li>
              <li>EBITDA &amp; Revenue 5-Year CAGR</li>
              <li>Multiple Analysis: P/E to PEG ratios</li>
              <li>Intrinsic Valuation (DCF Model value range)</li>
            </ul>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Qualitative Factors (40%)
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4 font-light">
              <li>Moat Scan Strength (Competitor barriers, market share)</li>
              <li>News Sentiment Index (Weekly weighted averages)</li>
              <li>Sector Growth Prospects</li>
            </ul>
          </div>
        </div>
        <p className="text-zinc-300 font-light leading-relaxed">
          The DCF simulator solves for intrinsic value by taking the free cash flows of the trailing 12 months, applying 5-year growth rates, discounting them by the Weighted Average Cost of Capital (WACC), and adding discounted terminal value.
        </p>
      </div>
    )
  },
  {
    id: 'setup',
    title: '4. Setup & Operations',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300 font-light leading-relaxed">
          Investryt supports auto-rotated API keys and server-sent events for real-time terminal tracing. Define your environment parameters:
        </p>
        <div className="border border-zinc-800 rounded-xl overflow-hidden font-mono text-xs text-zinc-400">
          <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 text-zinc-300 font-semibold">
            backend/.env
          </div>
          <div className="p-4 bg-zinc-950/40 space-y-1 overflow-x-auto">
            <div>PORT=5000</div>
            <div className="text-zinc-600"># Multiple keys separated by commas for auto-rotation</div>
            <div>GEMINI_API_KEYS=key1,key2,key3</div>
            <div>TAVILY_API_KEYS=key1,key2</div>
            <div>FMP_API_KEYS=fmp_key</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-light">
          <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
          <span>Make sure you copy <strong>.env.example</strong> to <strong>.env</strong> in the backend directory.</span>
        </div>
      </div>
    )
  }
];

export default function Documentation() {
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full bg-[#09090b]">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-10">
        <div className="w-full max-w-[1280px] h-full border-l border-r border-zinc-700/30 opacity-30" />
      </div>

      <Header />

      <main className="flex-1 site-container relative z-20 py-12 md:py-20 flex flex-col lg:flex-row gap-12">
        {/* Left Sticky Sidebar */}
        <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-[120px] h-fit">
          <div className="border border-zinc-800 bg-zinc-950/40 backdrop-blur-md rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 px-2">Table of Contents</h3>
            <nav className="flex flex-col gap-2">
              {docSections.map((sec) => {
                const SecIcon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                      isActive 
                        ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 font-semibold' 
                        : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                    }`}
                  >
                    <SecIcon className="h-4.5 w-4.5" />
                    <span className="text-sm">{sec.title.split('. ')[1]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content Area */}
        <section className="flex-1 space-y-12">
          {docSections.map((sec) => {
            const SecIcon = sec.icon;
            return (
              <div 
                key={sec.id} 
                id={sec.id}
                className="scroll-mt-[100px] border border-zinc-800/80 bg-zinc-950/30 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl"
              >
                <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4 mb-6">
                  <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                    <SecIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{sec.title}</h2>
                </div>
                {sec.content}
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4 z-20 relative">
        <div className="site-container flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; 2026 Investryt AI. All rights reserved. Developed for InsideIIM &times; Altuni AI Labs.
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            Powered by Gemini 2.5 &amp; Tavily Search Engines
          </div>
        </div>
      </footer>
    </div>
  );
}
