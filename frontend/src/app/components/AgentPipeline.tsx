"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import type { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Loader2, Check, AlertCircle, Clock, PanelLeftClose, PanelLeft, ChevronRight } from 'lucide-react';

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
    { step: 'company_profile', label: 'Corporate Profile', desc: 'Fetch general profile, sector, and industry details', est: 3 },
    { step: 'financial_data', label: 'Financial Statements', desc: 'Pull 5-year income statements, balance sheets, and cash flows', est: 8 },
    { step: 'market_data', label: 'Market Valuation', desc: 'Compile key multiples, ratios, and price charts', est: 4 },
    { step: 'web_research', label: 'Moat & Competition', desc: 'Perform web analysis on market share and competitors', est: 12 },
    { step: 'news_sentiment', label: 'News Sentiment Scan', desc: 'Index and analyze recent articles for public sentiment', est: 10 },
    { step: 'analysis', label: 'Valuation & Thesis Models', desc: 'Synthesize data and formulate investment thesis', est: 15 },
    { step: 'report_generation', label: 'Report Compilation', desc: 'Assemble final structured dashboard research paper', est: 5 },
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
      <div className="w-full h-full bg-[rgba(18,18,20,.68)] backdrop-blur-xl border border-[rgba(255,255,255,.06)] flex flex-col items-center shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-hidden relative py-2 gap-0">
        <button
          onClick={onToggleCollapse}
          className="text-zinc-500 hover:text-white transition-colors p-0.5 mt-1"
          title="Expand panel"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center gap-3 flex-1 justify-center px-1">
          {pipelineSteps.map(({ step }) => {
            const state = getStepState(step);
            const isCompleted = state === 'completed';
            const isRunning = state === 'running';

            return (
              <div key={step} className="relative flex items-center justify-center">
                <div className={`flex items-center justify-center w-5 h-5 rounded-full border transition-all duration-300 ${
                  isCompleted ? 'bg-[rgba(16,185,129,.15)] border-[rgba(16,185,129,.3)]' :
                  isRunning ? 'bg-[rgba(34,211,238,.15)] border-[rgba(34,211,238,.4)] shadow-[0_0_12px_rgba(34,211,238,0.2)]' :
                  'bg-[rgba(24,24,27,.6)] border-[rgba(255,255,255,.06)]'
                }`}>
                  {isCompleted ? <Check className="h-2.5 w-2.5 text-emerald-500" strokeWidth={3} /> :
                   isRunning ? <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-400" /> :
                   <div className="h-1 w-1 rounded-full bg-zinc-700" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-8 h-1 rounded-full bg-[rgba(255,255,255,.05)] overflow-hidden mx-2 mb-1">
          <div
            className="h-full bg-gradient-to-r from-cyan-500/60 via-purple-500/60 to-pink-500/60 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,.68)] backdrop-blur-xl border border-[rgba(255,255,255,.06)] flex flex-col shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-hidden relative">

      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-[rgba(255,255,255,.04)] shrink-0 relative z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-zinc-500 hover:text-white transition-colors p-0.5 -ml-0.5"
            title="Collapse panel"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Agent Workflow</h2>
            <p className="text-[9px] text-zinc-500 font-medium mt-0.5 uppercase tracking-[0.2em]">Execution Pipeline</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-[rgba(15,15,17,.8)] hover:bg-[rgba(239,68,68,.1)] text-zinc-400 hover:text-red-400 rounded-full text-[8px] font-bold border border-[rgba(255,255,255,.03)] hover:border-[rgba(239,68,68,.2)] transition-all uppercase tracking-[0.2em] shadow-sm backdrop-blur-xl flex items-center gap-1.5 group"
        >
          <span className="h-1 w-1 rounded-full bg-zinc-600 group-hover:bg-red-500 transition-colors" />
          Abort
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar relative z-10">
        <div className="relative">

          <div className="absolute left-[11px] top-1.5 bottom-1.5 w-[1.5px] bg-[rgba(255,255,255,.03)] rounded-full" />

          <div
            className="absolute left-[11px] top-1.5 w-[1.5px] bg-gradient-to-b from-cyan-400/80 to-purple-500/60 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-1000 ease-in-out"
            style={{ height: `${Math.max(0, (completedStepsCount / (pipelineSteps.length - 1)) * 100)}%`, opacity: completedStepsCount > 0 ? 1 : 0 }}
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                    className={`relative flex items-start group ${isPending ? 'opacity-40 hover:opacity-70 transition-all duration-500' : 'transition-all duration-500'}`}
                  >

                    <div className="relative z-10 flex flex-col items-center shrink-0 mt-0.5">
                      <div className={`flex items-center justify-center w-5 h-5 rounded-full border backdrop-blur-xl transition-all duration-500 ${
                        isCompleted ? 'bg-[rgba(16,185,129,.08)] border-[rgba(16,185,129,.2)] text-emerald-500/80' :
                        isRunning ? 'bg-[rgba(34,211,238,.12)] border-[rgba(34,211,238,.35)] text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]' :
                        'bg-[rgba(24,24,27,.6)] border-[rgba(255,255,255,.04)] text-zinc-600 group-hover:border-[rgba(255,255,255,.1)] group-hover:text-zinc-400'
                      }`}>

                        {isRunning && (
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                            className="absolute inset-0 rounded-full border border-cyan-400/40"
                          />
                        )}

                        {isCompleted ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> :
                         isRunning ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> :
                         <div className={`h-1 w-1 rounded-full ${isPending ? 'bg-zinc-700 group-hover:bg-zinc-500 transition-colors' : 'bg-transparent'}`} />}
                      </div>
                    </div>

                    <div className="ml-3 flex-1 group/card relative">
                      {isRunning && (
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/30 via-purple-500/10 to-transparent rounded-xl opacity-70 blur-[2px] transition-opacity duration-1000" />
                      )}

                      <div className={`px-3.5 py-2.5 rounded-xl transition-all duration-500 relative overflow-hidden backdrop-blur-2xl ${
                        isRunning
                          ? 'bg-[rgba(18,18,20,.6)] border border-transparent shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                          : isCompleted
                          ? 'bg-[rgba(255,255,255,.015)] border border-[rgba(255,255,255,.04)]'
                          : 'bg-transparent border border-transparent'
                      }`}>

                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-[11px] tracking-wide transition-colors duration-300 ${
                            isCompleted ? 'text-zinc-300 font-medium' :
                            isRunning ? 'text-white font-bold' :
                            'text-zinc-500 font-medium'
                          }`}>
                            {label}
                          </h4>

                          {(isRunning || isCompleted) && (
                            <span className={`text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full backdrop-blur-md shrink-0 ${
                              isCompleted ? 'text-emerald-500/60 border border-[rgba(16,185,129,.1)]' :
                              isRunning ? 'text-cyan-400 border border-[rgba(34,211,238,.2)]' : ''
                            }`}>
                              {isCompleted ? 'Done' : 'Active'}
                            </span>
                          )}
                        </div>

                        <p className={`text-[9px] leading-relaxed font-light mt-1 transition-colors duration-300 ${
                          isRunning ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                          {desc}
                        </p>

                        <div className={`flex items-center gap-1.5 mt-1.5 text-[8px] font-medium transition-colors duration-300 ${
                          isRunning ? 'text-cyan-500/60' : 'text-zinc-700'
                        }`}>
                          <Clock className="h-2 w-2 opacity-70" />
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
      <div className="shrink-0 px-5 py-4 border-t border-[rgba(255,255,255,.04)] relative z-10">
        <div className="flex justify-between items-end mb-2.5">
          <div>
            <span className="text-[7px] text-zinc-500 uppercase tracking-[0.2em] block font-bold opacity-70">Progress</span>
            <span className="text-xl font-extrabold text-white tracking-tight">{progressPercent}%</span>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-zinc-500 uppercase tracking-[0.2em] block font-bold opacity-70">Remaining</span>
            <span className="text-[10px] font-mono text-cyan-400/90 font-bold tracking-widest">{remainingTime > 0 ? `~${remainingTime}s` : 'Complete'}</span>
          </div>
        </div>

        <div className="w-full h-1.5 bg-[rgba(255,255,255,.03)] rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500/80 via-purple-500/80 to-pink-500/80 transition-all duration-[1200ms] ease-out relative rounded-full"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)] -translate-x-full animate-[shimmer_3s_infinite_linear]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
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
