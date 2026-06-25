"use client";

// ============================================================
// Investryt AI — Agent Pipeline Progress & Streaming Terminal
// ============================================================

import React, { useEffect, useRef } from 'react';
import type { AgentStep, StepStatus } from '../../types/index.js';
import { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Loader2, Check, AlertCircle, Play, Terminal } from 'lucide-react';

interface AgentProgressProps {
  currentStep: AgentStep | null;
  stepStatus: StepStatus;
  stepMessage: string;
  progressLog: ProgressLogEntry[];
  onCancel: () => void;
}

export default function AgentProgress({
  currentStep,
  stepStatus,
  stepMessage,
  progressLog,
  onCancel,
}: AgentProgressProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal log to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progressLog, stepMessage]);

  const pipelineSteps: { step: AgentStep; label: string; desc: string }[] = [
    { step: 'resolve_company', label: 'Company Resolution', desc: 'Identify ticker and target market index' },
    { step: 'company_profile', label: 'Corporate Profile', desc: 'Fetch general profile, sector, and industry details' },
    { step: 'financial_data', label: 'Financial Statements', desc: 'Pull 5-year income statements, balance sheets, and cash flows' },
    { step: 'market_data', label: 'Market Valuation', desc: 'Compile key multiples, ratios, and price charts' },
    { step: 'web_research', label: 'Moat & Competition', desc: 'Perform web analysis on market share and competitors' },
    { step: 'news_sentiment', label: 'News Sentiment Scan', desc: 'Index and analyze recent articles for public sentiment' },
    { step: 'analysis', label: 'Valuation & Thesis Models', desc: 'Synthesize data and formulate investment thesis' },
    { step: 'report_generation', label: 'Report Compilation', desc: 'Assemble final structured dashboard research paper' },
  ];

  // Helper to get step status styling
  const getStepState = (step: AgentStep) => {
    const entry = progressLog.find((e) => e.step === step);
    if (!entry) return { status: 'pending', color: 'border-zinc-800 text-zinc-600', dot: 'bg-zinc-800' };
    
    if (entry.status === 'running') {
      return { status: 'running', color: 'border-teal-500 text-teal-400 font-bold shadow-[0_0_15px_rgba(20,184,166,0.2)]', dot: 'bg-teal-500 animate-ping' };
    }
    if (entry.status === 'completed') {
      return { status: 'completed', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5', dot: 'bg-emerald-500' };
    }
    if (entry.status === 'error') {
      return { status: 'error', color: 'border-red-500 text-red-400 bg-red-500/5', dot: 'bg-red-500' };
    }
    
    return { status: 'pending', color: 'border-zinc-800 text-zinc-600', dot: 'bg-zinc-800' };
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
      {/* LEFT PANEL: Pipeline Steps Visual */}
      <div className="w-full lg:w-1/2 bg-[#141416] border border-[#232326] rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex justify-between items-center border-b border-[#232326] pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Play className="h-5 w-5 text-teal-400 animate-pulse" />
              Research Agent Running
            </h2>
            <p className="text-xs text-zinc-500 font-light mt-0.5">LangGraph StateGraph processing steps sequentially</p>
          </div>
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-red-400 rounded-lg text-xs font-semibold border border-red-500/20 transition-all uppercase tracking-wider"
          >
            Abort Run
          </button>
        </div>

        {/* Vertical Pipeline Steps list */}
        <div className="flex flex-col gap-5 relative pl-4 border-l border-zinc-800/80 py-2">
          {pipelineSteps.map(({ step, label, desc }) => {
            const state = getStepState(step);
            return (
              <div key={step} className={`relative flex gap-4 p-3 rounded-xl border transition-all duration-300 ${state.color}`}>
                {/* Status Dot */}
                <div className="absolute -left-[22px] top-1/2 -translate-y-1/2 flex items-center justify-center h-3 w-3 bg-[#09090b]">
                  <span className={`h-2 w-2 rounded-full ${state.dot}`} />
                </div>

                {/* Left Step Icons */}
                <div className="flex items-center justify-center shrink-0">
                  {state.status === 'running' && <Loader2 className="h-5 w-5 animate-spin text-teal-400" />}
                  {state.status === 'completed' && <Check className="h-5 w-5 text-emerald-400" />}
                  {state.status === 'error' && <AlertCircle className="h-5 w-5 text-red-400" />}
                  {state.status === 'pending' && <div className="h-5 w-5 rounded-full border border-zinc-800" />}
                </div>

                {/* Label text */}
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{label}</h4>
                  <p className="text-xs text-zinc-500 leading-normal font-light mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Real-time Terminal Log stream */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-[#141416] border border-[#232326] px-4 py-3 rounded-xl">
          <Terminal className="h-4 w-4 text-teal-400" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live Execution Stream</span>
        </div>

        <div className="flex-1 min-h-[400px] lg:min-h-[500px] max-h-[550px] bg-black border border-[#232326] rounded-2xl p-5 overflow-y-auto flex flex-col gap-3 font-mono text-xs text-teal-400/90 shadow-2xl relative">
          {/* Subtle grid styling overlay for terminal */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
          
          <div className="text-zinc-600 border-b border-zinc-800/80 pb-2">
            [Investryt Agent Session Initialized - UTC 2026]
          </div>

          {progressLog.map((log, index) => {
            const logColors = {
              pending: 'text-zinc-600',
              running: 'text-teal-400',
              completed: 'text-emerald-400',
              error: 'text-red-500 font-bold',
            };
            const lc = logColors[log.status] || 'text-zinc-300';

            return (
              <div key={index} className="flex flex-col gap-1 border-b border-zinc-900/40 pb-2">
                <div className={`flex justify-between items-start ${lc}`}>
                  <span>
                    &gt; {log.message}
                  </span>
                  <span className="text-zinc-600 text-[10px] shrink-0">{log.timestamp}</span>
                </div>
                
                {/* Print payload data if present */}
                {log.data && (
                  <pre className="text-[10px] text-zinc-500 bg-[#09090b] p-2.5 rounded-lg border border-zinc-900/80 overflow-x-auto whitespace-pre-wrap max-h-48 mt-1">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}

          {/* Current execution indicator */}
          {stepStatus === 'running' && (
            <div className="text-teal-400/80 animate-pulse flex items-center gap-1 mt-1">
              &gt; Running agent step [{currentStep}]...
              <span className="inline-block h-3.5 w-1.5 bg-teal-400 animate-blink" />
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}
