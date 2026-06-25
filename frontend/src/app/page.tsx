"use client";

// ============================================================
// Investryt AI — Main Single Page Application Shell
// ============================================================

import React from 'react';
import { useResearchAgent } from './hooks/useResearchAgent';
import SearchHero from './components/SearchHero';
import AgentProgress from './components/AgentProgress';
import ReportDetails from './components/reportDetails';
import { Sparkles, RefreshCw, AlertTriangle, Cpu } from 'lucide-react';

export default function Home() {
  const {
    loading,
    error,
    currentStep,
    stepStatus,
    stepMessage,
    progressLog,
    report,
    profile,
    financials,
    metrics,
    priceHistory,
    runResearch,
    cancelResearch,
  } = useResearchAgent();

  const handleStartResearch = (query: string) => {
    runResearch(query);
  };

  const handleNewResearch = () => {
    window.location.reload(); // Quick reset
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-[#232326] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#141416] border border-[#232326] rounded-lg shadow-md">
            <Cpu className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Investryt <span className="text-teal-400">AI</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase ml-2 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
              Agentic v1.0
            </span>
          </div>
        </div>

        {report && (
          <button
            onClick={handleNewResearch}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#232326] hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            New Research
          </button>
        )}
      </header>

      {/* ERROR BANNER */}
      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 mt-6">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Research Execution Error</h4>
              <p className="text-xs text-red-400/90 font-light mt-1">{error}</p>
              <button
                onClick={handleNewResearch}
                className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all uppercase tracking-wider"
              >
                Reset and Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN RENDER PANEL */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
        {/* State A: Landing Page Search */}
        {!loading && !report && (
          <SearchHero onSearch={handleStartResearch} loading={loading} />
        )}

        {/* State B: Research Execution Progress */}
        {loading && !report && (
          <AgentProgress
            currentStep={currentStep}
            stepStatus={stepStatus}
            stepMessage={stepMessage}
            progressLog={progressLog}
            onCancel={cancelResearch}
          />
        )}

        {/* State C: Final Equity Research Report Dashboard */}
        {!loading && report && profile && financials && metrics && (
          <ReportDetails
            report={report}
            profile={profile}
            financials={financials}
            metrics={metrics}
            priceHistory={priceHistory}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          © 2026 Investryt AI. All rights reserved. Developed for InsideIIM × Altuni AI Labs.
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Powered by Gemini 1.5 & Tavily Search Engines
        </div>
      </footer>
    </div>
  );
}
