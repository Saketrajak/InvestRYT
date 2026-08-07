"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useResearchAgent } from '../hooks/useResearchAgent';
import Header from '../components/Header';
import AgentPipeline from '../components/AgentPipeline';
import AgentTerminal from '../components/AgentTerminal';
import ReportSkeleton from '../components/ReportSkeleton';
import { AlertTriangle } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query') || '';
  const hasStarted = useRef(false);

  const {
    loading,
    error,
    currentStep,
    stepStatus,
    progressLog,
    report,
    profile,
    financials,
    metrics,
    priceHistory,
    runResearch,
    cancelResearch,
  } = useResearchAgent();

  const [pipelineCollapsed, setPipelineCollapsed] = useState(false);

  // Run research when query is present
  useEffect(() => {
    if (query && !hasStarted.current) {
      hasStarted.current = true;
      runResearch(query);
    }
  }, [query, runResearch]);

  // When report completes, store in localStorage and redirect
  useEffect(() => {
    if (!loading && report && profile && financials && metrics) {
      const ticker = (profile.ticker || query).toUpperCase();
      const storageKey = `investryt_report_${ticker}`;
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            report,
            profile,
            financials,
            metrics,
            priceHistory: priceHistory || [],
            timestamp: Date.now(),
          })
        );
        router.push(`/report?ticker=${encodeURIComponent(ticker)}`);
      } catch (err) {
        console.error('[SearchPage] Failed to save report data to localStorage:', err);
      }
    }
  }, [loading, report, profile, financials, metrics, priceHistory, router, query]);

  const handleNewResearch = () => {
    cancelResearch();
    router.push('/');
  };

  if (!query) {
    router.replace('/');
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full bg-[#060608] text-zinc-300 overflow-x-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none z-0" />

      <Header showNewResearch onNewResearch={handleNewResearch} />

      {error && (
        <div className="max-w-5xl mx-auto w-full px-8 mt-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-start gap-4 shadow-2xl backdrop-blur-md"
          >
            <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5 text-red-500" />
            <div>
              <h4 className="font-bold text-base text-white">Pipeline Execution Error</h4>
              <p className="text-sm text-red-400/90 font-light mt-1.5 leading-relaxed">{error}</p>
              <button
                onClick={handleNewResearch}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shadow-sm"
              >
                Reset and Try Again
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <main className="flex-1 w-full relative z-10 flex flex-col overflow-hidden py-6">
        <div className="flex-1 w-full max-w-[1520px] mx-auto px-8 lg:px-10 flex gap-6 relative h-[calc(100vh-140px)]">
          {/* Left Panel: Workflow Pipeline */}
          <motion.div
            animate={{ width: pipelineCollapsed ? 64 : 280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0 h-full overflow-hidden"
          >
            <AgentPipeline
              collapsed={pipelineCollapsed}
              onToggleCollapse={() => setPipelineCollapsed(!pipelineCollapsed)}
              currentStep={currentStep}
              stepStatus={stepStatus}
              progressLog={progressLog}
              onCancel={handleNewResearch}
            />
          </motion.div>

          {/* Right Panel: Terminal logs */}
          <div className="flex-1 min-w-0 h-full">
            <AnimatePresence mode="wait">
              {loading || progressLog.length > 0 ? (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <AgentTerminal
                    currentStep={currentStep}
                    stepStatus={stepStatus}
                    progressLog={progressLog}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <ReportSkeleton progressLog={progressLog} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#060608]">
        <div className="text-zinc-500 text-sm font-medium flex items-center gap-3">
          <div className="h-4 w-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span>Loading research workspace...</span>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
