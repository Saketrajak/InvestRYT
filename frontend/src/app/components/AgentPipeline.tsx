"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import type { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Loader2, Check, Clock, PanelLeftClose, PanelLeft } from 'lucide-react';

interface AgentPipelineProps {
  currentStep: AgentStep | null;
  stepStatus: StepStatus;
  progressLog: ProgressLogEntry[];
  onCancel: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AgentPipeline({
  currentStep,
  stepStatus,
  progressLog,
  onCancel,
  collapsed,
  onToggleCollapse,
}: AgentPipelineProps) {
  const pipelineSteps: { step: AgentStep; label: string; desc: string; est: number }[] = [
    { step: 'resolve_company', label: 'Company Resolution', desc: 'Identify ticker and target market index', est: 2 },
    { step: 'company_profile', label: 'Corporate Profile', desc: 'Fetch profile description and sector details', est: 3 },
    { step: 'financial_data', label: 'Financial Statements', desc: 'Extract 5-year financials and cash flows', est: 8 },
    { step: 'market_data', label: 'Market Valuation', desc: 'Compile key multiples and stock history', est: 4 },
    { step: 'web_research', label: 'Moat & Competition', desc: 'Perform competitor analysis on the web', est: 12 },
    { step: 'news_sentiment', label: 'News Sentiment Scan', desc: 'Scan headlines for positive/negative weights', est: 10 },
    { step: 'analysis', label: 'Valuation & Thesis Models', desc: 'Formulate valuation and investment thesis', est: 15 },
    { step: 'report_generation', label: 'Report Compilation', desc: 'Format final dashboard data structures', est: 5 },
  ];

  const getStepState = (step: AgentStep) => {
    const entry = progressLog.find((e) => e.step === step);
    if (!entry) return 'pending';
    return entry.status;
  };

  const completedStepsCount = progressLog.filter(e => e.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / pipelineSteps.length) * 100);

  let remainingTime = 0;
  pipelineSteps.forEach((s) => {
    const state = getStepState(s.step);
    if (state !== 'completed') {
      remainingTime += s.est;
    }
  });

  if (collapsed) {
    return (
      <div className="w-full h-full bg-[#0c0c0e]/85 backdrop-blur-2xl border border-zinc-800 flex flex-col items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden py-4 gap-4 rounded-3xl">
        <button
          onClick={onToggleCollapse}
          className="text-zinc-500 hover:text-white transition-colors p-1"
          title="Expand pipeline panel"
        >
          <PanelLeft className="h-4.5 w-4.5" />
        </button>

        <div className="flex flex-col items-center gap-4 flex-1 justify-center px-1 w-full">
          {pipelineSteps.map(({ step }) => {
            const state = getStepState(step);
            const isCompleted = state === 'completed';
            const isRunning = state === 'running';

            return (
              <div key={step} className="relative flex items-center justify-center">
                <div className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' :
                  isRunning ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]' :
                  'bg-zinc-900 border-zinc-800'
                }`}>
                  {isCompleted ? <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} /> :
                   isRunning ? <Loader2 className="h-3 w-3 animate-spin text-cyan-400" /> :
                   <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-8 h-1 bg-zinc-850 rounded-full overflow-hidden mx-2 mb-1">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-[800ms]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0c0c0e]/85 backdrop-blur-2xl border border-zinc-800 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl relative">

      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-800 shrink-0 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleCollapse}
            className="text-zinc-500 hover:text-white transition-colors p-1"
            title="Collapse pipeline panel"
          >
            <PanelLeftClose className="h-4.5 w-4.5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-white tracking-tight truncate">Agent Pipeline</h2>
            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.25em] mt-0.5">Workflow Steps</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-red-950/10 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-xl text-[9px] font-bold border border-zinc-850 hover:border-red-500/20 transition-all uppercase tracking-wider shrink-0 flex items-center gap-1.5"
        >
          <span className="h-1 w-1 rounded-full bg-zinc-600 hover:bg-red-500" />
          Abort
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar relative z-10 flex flex-col gap-4">
        <div className="relative h-full">
          {/* Vertical connecting line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-zinc-800" />

          {/* Active progress indicator line overlay */}
          <div
            className="absolute left-[11px] top-2 w-[1px] bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(0, (completedStepsCount / (pipelineSteps.length - 1)) * 95)}%`, opacity: completedStepsCount > 0 ? 1 : 0 }}
          />

          <div className="flex flex-col gap-4 relative">
            <AnimatePresence>
              {pipelineSteps.map(({ step, label, desc, est }, idx) => {
                const state = getStepState(step);
                const isRunning = state === 'running';
                const isCompleted = state === 'completed';
                const isPending = state === 'pending';

                return (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.04, ease: "easeOut" }}
                    className={`relative flex items-start group ${isPending ? 'opacity-35 hover:opacity-60 transition-all' : 'transition-all'}`}
                  >
                    <div className="relative z-10 flex flex-col items-center shrink-0 mt-1">
                      <div className={`flex items-center justify-center w-5 h-5 rounded-lg border backdrop-blur-xl transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        isRunning ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)] animate-pulse' :
                        'bg-zinc-900 border-zinc-800 text-zinc-600'
                      }`}>
                        {isCompleted ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> :
                         isRunning ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> :
                         <div className="h-1 w-1 rounded-full bg-zinc-700" />}
                      </div>
                    </div>

                    <div className="ml-3.5 flex-1">
                      <div className={`px-3 py-2.5 rounded-2xl border transition-all duration-500 relative ${
                        isRunning
                          ? 'bg-zinc-900/50 border-cyan-500/20 shadow-[0_4px_15px_rgba(6,182,212,0.05)]'
                          : isCompleted
                          ? 'bg-zinc-900/10 border-zinc-800/40'
                          : 'bg-transparent border-transparent'
                      }`}>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className={`text-[11px] font-bold tracking-tight transition-colors duration-300 ${
                            isCompleted ? 'text-zinc-300' :
                            isRunning ? 'text-white' :
                            'text-zinc-500 font-medium'
                          }`}>
                            {label}
                          </h4>
                          {(isRunning || isCompleted) && (
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg shrink-0 ${
                              isCompleted ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' :
                              isRunning ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 animate-pulse' : ''
                            }`}>
                              {isCompleted ? 'Done' : 'Active'}
                            </span>
                          )}
                        </div>

                        <p className={`text-[9px] leading-relaxed font-light mt-1.5 ${
                          isRunning ? 'text-zinc-400' : 'text-zinc-650'
                        }`}>
                          {desc}
                        </p>

                        <div className={`flex items-center gap-1 mt-2 text-[8px] font-semibold ${
                          isRunning ? 'text-cyan-500/70' : 'text-zinc-700'
                        }`}>
                          <Clock className="h-2.5 w-2.5 opacity-60" />
                          <span className="uppercase tracking-widest">{est}s</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      <div className="shrink-0 px-5 py-4 border-t border-zinc-850 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-black opacity-80">Execution Progress</span>
            <span className="text-lg font-black text-white tracking-tight">{progressPercent}%</span>
          </div>
          <div className="text-right">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-black opacity-80">Est. Time</span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
              {remainingTime > 0 ? `~${remainingTime}s` : 'Redirecting...'}
            </span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-zinc-900 border border-zinc-850/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full transition-all duration-[1200ms] ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full animate-[pipeline-shimmer_3s_infinite_linear]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pipeline-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}
