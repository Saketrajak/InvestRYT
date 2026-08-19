"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Cpu, Database, BarChart3, Network,
  Radio, Zap, ShieldCheck, TrendingUp, FileText,
  CheckCircle2, AlertCircle, Clock, ArrowRight, Sparkles
} from 'lucide-react';

// ── Pipeline Data ─────────────────────────────────────────────────────────────

const nodes = [
  {
    id: 'resolve',
    label: 'Resolve',
    title: 'Company Resolution',
    icon: Search,
    tag: 'SYMBOL_MAPPER',
    desc: 'Translates free-text queries into verified exchange ticker symbols across NYSE, NASDAQ, NSE, BSE, and global markets.',
    mockup: (
      <div className="space-y-3">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Resolver Output</div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-300 font-light">"Apple"</span>
          <ArrowRight className="h-3 w-3 text-zinc-600 mx-1" />
          <span className="text-sm font-mono font-semibold text-teal-400">AAPL</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-300 font-light">"Reliance"</span>
          <ArrowRight className="h-3 w-3 text-zinc-600 mx-1" />
          <span className="text-sm font-mono font-semibold text-teal-400">RELIANCE.NS</span>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
          <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
          <span className="text-sm text-zinc-300 font-light">"Samsung"</span>
          <ArrowRight className="h-3 w-3 text-zinc-600 mx-1" />
          <span className="text-sm font-mono font-semibold text-teal-400">005930.KS</span>
        </div>
        <p className="text-[11px] text-zinc-600 font-light mt-2">3 markets · 0 ambiguity</p>
      </div>
    )
  },
  {
    id: 'profile',
    label: 'Profile',
    title: 'Corporate Profiling',
    icon: Cpu,
    tag: 'METADATA_EXTRACTOR',
    desc: 'Builds a comprehensive company card — sector, sub-industry, headquarters, founding year, and market cap classification.',
    mockup: (
      <div className="space-y-3">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Company Card</div>
        <div className="text-lg font-bold text-white">Apple Inc.</div>
        <div className="flex flex-wrap gap-2 mt-1">
          {['Technology', 'Consumer Electronics', 'Mega-Cap'].map(t => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[11px] font-semibold">{t}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {[['Exchange', 'NASDAQ'], ['Founded', '1976'], ['HQ', 'Cupertino, CA'], ['Employees', '160,000+']].map(([k, v]) => (
            <div key={k} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <div className="text-zinc-600 font-light">{k}</div>
              <div className="text-zinc-200 font-semibold mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'financials',
    label: 'Financials',
    title: 'Statement Extraction',
    icon: Database,
    tag: 'STATEMENT_PARSER',
    desc: '5 years of complete annual financials — income statements, balance sheets, and cash flows — sourced without paid API keys.',
    mockup: (
      <div className="overflow-x-auto">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Revenue Trend (USD Bn)</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left font-semibold text-zinc-500 pb-2">Metric</th>
              {['FY21','FY22','FY23','FY24','FY25'].map(y => (
                <th key={y} className="text-right font-semibold text-zinc-500 pb-2">{y}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-zinc-300 font-light">
            {[
              ['Revenue', '365', '394', '383', '391', '436'],
              ['Gross Profit', '153', '170', '169', '181', '212'],
              ['Net Income', '95', '100', '97', '101', '124'],
            ].map(([label, ...vals]) => (
              <tr key={label} className="border-b border-zinc-800/50">
                <td className="py-2 text-zinc-400 font-medium pr-4">{label}</td>
                {vals.map((v, i) => (
                  <td key={i} className={`text-right py-2 ${i === vals.length - 1 ? 'text-teal-400 font-semibold' : ''}`}>${v}B</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  {
    id: 'metrics',
    label: 'Metrics',
    title: 'Market Multiples',
    icon: BarChart3,
    tag: 'RATIO_ENGINE',
    desc: 'Computes real-time P/E, PEG, EV/EBITDA, Price-to-Sales, ROE, and ROCE ratios alongside 1-year price history for charting.',
    mockup: (
      <div className="space-y-2.5">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Key Multiples</div>
        {[
          { label: 'P/E Ratio', value: '30.2×', color: 'text-amber-400' },
          { label: 'PEG Ratio', value: '1.42', color: 'text-emerald-400' },
          { label: 'EV/EBITDA', value: '24.7×', color: 'text-amber-400' },
          { label: 'Price/Sales', value: '8.1×', color: 'text-zinc-200' },
          { label: 'ROE', value: '160%', color: 'text-emerald-400' },
          { label: 'ROCE', value: '53.2%', color: 'text-emerald-400' },
        ].map(m => (
          <div key={m.label} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5">
            <span className="text-xs text-zinc-400 font-light">{m.label}</span>
            <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'moat',
    label: 'Moat',
    title: 'Competitive Moat Scan',
    icon: Network,
    tag: 'WEB_CRAWLER',
    desc: 'Runs autonomous Tavily web searches to evaluate market share, product moat, switching costs, brand equity, and barriers to entry.',
    mockup: (
      <div className="space-y-3">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Moat Assessment</div>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg">WIDE MOAT</span>
          <span className="text-xs text-zinc-500 font-light">Confidence: 92%</span>
        </div>
        {[
          { factor: 'Brand Equity', score: 95 },
          { factor: 'Ecosystem Lock-in', score: 88 },
          { factor: 'Distribution Network', score: 81 },
          { factor: 'IP & Patents', score: 74 },
        ].map(f => (
          <div key={f.factor}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">{f.factor}</span>
              <span className="text-zinc-300 font-semibold">{f.score}/100</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${f.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'sentiment',
    label: 'Sentiment',
    title: 'News Sentiment Analysis',
    icon: Radio,
    tag: 'NLP_CLASSIFIER',
    desc: 'Aggregates the last 30 days of financial news, classifies each headline, and builds a weighted sentiment index for the equity.',
    mockup: (
      <div className="space-y-3">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Sentiment Index</div>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-black text-emerald-400">72</div>
          <div>
            <div className="text-sm font-semibold text-white">Bullish</div>
            <div className="text-xs text-zinc-500 font-light">Composite score / 100</div>
          </div>
        </div>
        {[
          { label: 'Positive', count: 18, color: 'bg-emerald-500' },
          { label: 'Neutral', count: 8, color: 'bg-zinc-600' },
          { label: 'Negative', count: 4, color: 'bg-red-500' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${s.color}`} />
            <span className="text-xs text-zinc-400 w-16">{s.label}</span>
            <div className="flex-1 h-1.5 bg-zinc-800 rounded-full">
              <div className={`h-full ${s.color} rounded-full`} style={{ width: `${(s.count / 30) * 100}%` }} />
            </div>
            <span className="text-xs text-zinc-500 font-mono">{s.count}</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'valuation',
    label: 'Valuation',
    title: 'Valuation Modeling',
    icon: Zap,
    tag: 'DCF_ENGINE',
    desc: 'Synthesizes all signals — financials, multiples, moat, and sentiment — into a DCF-backed fair value range and final investment verdict.',
    mockup: (
      <div className="space-y-4">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Final Verdict</div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-emerald-400 tracking-tight">INVEST</div>
          <div className="text-xs text-emerald-500/70 font-light mt-1">Recommendation Confidence: 87%</div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {[['Bear', '$168'], ['Base', '$218'], ['Bull', '$265']].map(([s, v]) => (
            <div key={s} className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5">
              <div className="text-zinc-500 font-light">{s}</div>
              <div className="text-zinc-100 font-bold mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-zinc-600 text-center font-light">DCF fair value range · 5Y projection</div>
      </div>
    )
  }
];

// ── Bento Grid Data ────────────────────────────────────────────────────────────

const KeyPoolBento = () => {
  const keys = [
    { suffix: '...Yvw', status: 'ACTIVE', active: true },
    { suffix: '...A24hA', status: 'ACTIVE', active: true },
    { suffix: '...VyIc', status: '429 COOLDOWN', active: false },
    { suffix: '...HT3Q', status: 'ACTIVE', active: true },
  ];
  return (
    <div className="space-y-2.5">
      <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Key Pool Status</div>
      {keys.map((k, i) => (
        <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border ${k.active ? 'bg-zinc-900 border-zinc-800' : 'bg-red-500/5 border-red-500/10'}`}>
          <span className="text-xs font-mono text-zinc-400">gemini-key-{i+1}{k.suffix}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${k.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{k.status}</span>
        </div>
      ))}
      <p className="text-[10px] text-zinc-600 font-light pt-1">Auto-rotates on 429 · 20 Gemini keys pooled</p>
    </div>
  );
};

const DcfBento = () => (
  <div className="space-y-3">
    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-3">DCF Simulator Inputs</div>
    {[
      { label: 'Revenue Growth', value: '12%' },
      { label: 'WACC', value: '9.5%' },
      { label: 'Terminal Multiple', value: '18×' },
    ].map(f => (
      <div key={f.label} className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
        <span className="text-xs text-zinc-400">{f.label}</span>
        <span className="font-mono text-sm font-bold text-amber-400">{f.value}</span>
      </div>
    ))}
    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
      <div className="text-xs text-zinc-400">Fair Value</div>
      <div className="text-2xl font-black text-emerald-400">$218</div>
    </div>
  </div>
);

const CacheBento = () => (
  <div>
    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Cache Engine</div>
    <div className="space-y-3">
      {[
        { key: 'AAPL/financials', ttl: '58m', full: 85 },
        { key: 'RELIANCE/news', ttl: '12m', full: 18 },
        { key: 'TSLA/profile', ttl: '41m', full: 62 },
      ].map(c => (
        <div key={c.key}>
          <div className="flex justify-between text-[10px] mb-1.5">
            <span className="font-mono text-zinc-400">{c.key}</span>
            <span className="text-zinc-500 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{c.ttl}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full">
            <div className="h-full bg-teal-500/70 rounded-full" style={{ width: `${c.full}%` }} />
          </div>
        </div>
      ))}
    </div>
    <p className="text-[10px] text-zinc-600 mt-4">TTL-based in-memory store · avoids redundant API calls</p>
  </div>
);

const PdfBento = () => (
  <div>
    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">PDF Report Exporter</div>
    <div className="border border-zinc-700/80 rounded-xl overflow-hidden">
      <div className="bg-white/5 px-4 py-3 border-b border-zinc-800">
        <div className="w-24 h-2 rounded bg-zinc-700/80 mb-2" />
        <div className="w-16 h-1.5 rounded bg-zinc-800" />
      </div>
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded bg-zinc-800/50" />)}
        </div>
        <div className="h-1.5 rounded bg-zinc-800 w-full" />
        <div className="h-1.5 rounded bg-zinc-800 w-3/4" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-[10px] text-zinc-400 font-mono self-center">Report_AAPL_2025.pdf</div>
        </div>
      </div>
    </div>
    <p className="text-[10px] text-zinc-600 mt-3">html2canvas + jsPDF · full chart capture</p>
  </div>
);

const YahooBento = () => (
  <div className="h-full flex flex-col justify-between">
    <div>
      <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-4">Global Coverage</div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { market: 'NYSE / NASDAQ', tag: 'US', examples: 'AAPL, MSFT, NVDA' },
          { market: 'NSE / BSE', tag: 'IN', examples: 'RELIANCE, TCS' },
          { market: 'KRX, TSE, LSE', tag: 'GLOBAL', examples: 'Samsung, Sony' },
        ].map(m => (
          <div key={m.market} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <span className="text-[10px] font-mono font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">{m.tag}</span>
            <div className="text-xs text-zinc-300 font-semibold mt-2 leading-tight">{m.market}</div>
            <div className="text-[10px] text-zinc-500 font-light mt-1">{m.examples}</div>
          </div>
        ))}
      </div>
    </div>
    <p className="text-[10px] text-zinc-600 mt-4">Zero paid API keys · powered by yahoo-finance2</p>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Features() {
  const [activeNode, setActiveNode] = useState(0);
  const ActiveIcon = nodes[activeNode].icon;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#09090b] text-zinc-300">
      {/* Ambient glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-teal-500/[0.04] rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

      <Header />

      <main className="flex-1 relative z-10">
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="site-container pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold font-mono uppercase tracking-[0.15em] text-teal-400 bg-teal-500/[0.07] border border-teal-500/15 rounded-full px-3.5 py-1.5 mb-7"
          >
            <Sparkles className="h-3 w-3" /> Platform Overview
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="text-[52px] md:text-[64px] font-black text-white leading-[1.05] tracking-[-0.03em] max-w-3xl mb-6"
          >
            Institutional AI.<br />
            <span className="text-zinc-500">Built for precision.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 }}
            className="text-[17px] text-zinc-400 font-light leading-relaxed max-w-xl mb-10"
          >
            Investryt orchestrates a 7-node LangGraph pipeline that maps companies, extracts 5-year financials,
            scans competitor moats, classifies news sentiment, and models fair value — all in real time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-zinc-950 text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-zinc-100 transition-colors"
            >
              Start Research <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>

        {/* ── PIPELINE ─────────────────────────────────────────────── */}
        <section className="border-t border-zinc-800/60 bg-zinc-950/30">
          <div className="site-container py-20">

            {/* Section label */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">How it works</div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Agent Pipeline</h2>
              </div>
              <div className="hidden md:flex items-center gap-2 text-xs text-zinc-600 font-mono">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LangGraph StateGraph · 7 nodes
              </div>
            </div>

            {/* Horizontal node tabs */}
            <div className="relative mb-10">
              {/* Connector line */}
              <div className="absolute top-5 left-0 right-0 h-px bg-zinc-800 z-0 hidden md:block" />

              <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-0 md:justify-between relative z-10">
                {nodes.map((node, idx) => {
                  const NodeIcon = node.icon;
                  const isActive = activeNode === idx;
                  const isPast = idx < activeNode;
                  return (
                    <button
                      key={node.id}
                      onClick={() => setActiveNode(idx)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive
                          ? 'bg-teal-500 border-teal-500 shadow-[0_0_16px_rgba(20,184,166,0.5)]'
                          : isPast
                          ? 'bg-zinc-800 border-zinc-700'
                          : 'bg-zinc-900 border-zinc-800 group-hover:border-zinc-600'
                      }`}>
                        <NodeIcon className={`h-4 w-4 ${isActive ? 'text-white' : isPast ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                      </div>
                      <span className={`text-[11px] font-semibold transition-colors whitespace-nowrap ${
                        isActive ? 'text-teal-400' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}>{node.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active node detail panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-zinc-800/80 rounded-2xl overflow-hidden"
              >
                {/* Left — text description */}
                <div className="p-8 md:p-10 bg-zinc-950/60 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-teal-500/10 rounded-xl">
                        <ActiveIcon className="h-5 w-5 text-teal-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Stage {activeNode + 1} of {nodes.length}</div>
                        <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">{nodes[activeNode].title}</h3>
                      </div>
                    </div>
                    <p className="text-[15px] text-zinc-400 font-light leading-[1.7]">{nodes[activeNode].desc}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-zinc-800/60 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                      agent_{nodes[activeNode].id}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-teal-500/70 bg-teal-500/5 border border-teal-500/10 px-2.5 py-1 rounded-full">
                      {nodes[activeNode].tag}
                    </span>
                  </div>
                </div>

                {/* Right — live mockup */}
                <div className="p-8 md:p-10 bg-zinc-900/30 border-t lg:border-t-0 lg:border-l border-zinc-800/80">
                  {nodes[activeNode].mockup}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Node navigation arrows */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setActiveNode(i => Math.max(0, i - 1))}
                disabled={activeNode === 0}
                className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-25 transition-colors px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <div className="flex gap-1.5">
                {nodes.map((_, i) => (
                  <button key={i} onClick={() => setActiveNode(i)} className={`h-1.5 rounded-full transition-all ${activeNode === i ? 'bg-teal-500 w-5' : 'bg-zinc-700 w-1.5 hover:bg-zinc-500'}`} />
                ))}
              </div>
              <button
                onClick={() => setActiveNode(i => Math.min(nodes.length - 1, i + 1))}
                disabled={activeNode === nodes.length - 1}
                className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-25 transition-colors px-4 py-2 rounded-lg border border-zinc-800 hover:border-zinc-700 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {/* ── BENTO GRID ───────────────────────────────────────────── */}
        <section className="site-container py-24">
          <div className="mb-14">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-2">Infrastructure</div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Platform Capabilities</h2>
          </div>

          {/* Bento grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-4">

            {/* Key Pool — spans 2 cols on large */}
            <div className="lg:col-span-2 bg-zinc-950/40 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700/80 transition-colors">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <ShieldCheck className="h-5 w-5 text-teal-400 mb-3" />
                  <h3 className="text-base font-bold text-white tracking-tight">AI Key Pool & Auto-Rotation</h3>
                  <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed max-w-sm">
                    20 Gemini, 6 Tavily, and 1 FMP key pooled. Automatic cooldown on 429s with round-robin rotation.
                  </p>
                </div>
              </div>
              <KeyPoolBento />
            </div>

            {/* TTL Cache */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700/80 transition-colors">
              <Clock className="h-5 w-5 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-white tracking-tight mb-1.5">TTL Cache Engine</h3>
              <p className="text-xs text-zinc-500 font-light mb-6 leading-relaxed">
                Prevents duplicate API calls with a time-limited in-memory store.
              </p>
              <CacheBento />
            </div>

            {/* Yahoo Finance */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700/80 transition-colors">
              <Database className="h-5 w-5 text-purple-400 mb-3" />
              <h3 className="text-base font-bold text-white tracking-tight mb-1.5">Keyless Global Markets</h3>
              <p className="text-xs text-zinc-500 font-light mb-6 leading-relaxed">
                5-year financials for US, Indian, and global equities without paid subscriptions.
              </p>
              <YahooBento />
            </div>

            {/* DCF Simulator */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700/80 transition-colors">
              <TrendingUp className="h-5 w-5 text-emerald-400 mb-3" />
              <h3 className="text-base font-bold text-white tracking-tight mb-1.5">DCF Valuation Simulator</h3>
              <p className="text-xs text-zinc-500 font-light mb-6 leading-relaxed">
                Recalculate fair value in real-time by adjusting growth assumptions interactively.
              </p>
              <DcfBento />
            </div>

            {/* PDF Export */}
            <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-7 hover:border-zinc-700/80 transition-colors">
              <FileText className="h-5 w-5 text-blue-400 mb-3" />
              <h3 className="text-base font-bold text-white tracking-tight mb-1.5">Institutional PDF Export</h3>
              <p className="text-xs text-zinc-500 font-light mb-6 leading-relaxed">
                Renders full charts, tables, and AI notes into a professional PDF document.
              </p>
              <PdfBento />
            </div>

          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <section className="border-t border-zinc-800/60">
          <div className="site-container py-20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Ready to research a stock?</h2>
              <p className="text-sm text-zinc-400 font-light">Enter any company or ticker — results in under 60 seconds.</p>
            </div>
            <Link
              href="/"
              className="shrink-0 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            >
              Launch Terminal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-6 z-10 relative">
        <div className="site-container flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-600 font-light">
          <div>&copy; 2026 Investryt AI · InsideIIM &times; Altuni AI Labs</div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Powered by Gemini 2.5 &amp; Tavily
          </div>
        </div>
      </footer>
    </div>
  );
}
