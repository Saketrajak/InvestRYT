"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Loader2, Check, AlertCircle, Clock, Play } from 'lucide-react';

interface AgentPipelineProps {
  currentStep: AgentStep | null;
  stepStatus: StepStatus;
  progressLog: ProgressLogEntry[];
  onCancel: () => void;
}

export default function AgentPipeline({
  currentStep,
  stepStatus,
  progressLog,
  onCancel,
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
    return entry.status; // 'running' | 'completed' | 'error'
  };

  const completedStepsCount = progressLog.filter(e => e.status === 'completed').length;
  const progressPercent = Math.round((completedStepsCount / pipelineSteps.length) * 100);

  // Calculate estimated remaining time
  let remainingTime = 0;
  pipelineSteps.forEach((s) => {
    const state = getStepState(s.step);
    if (state !== 'completed') {
      remainingTime += s.est;
    }
  });

  return (
    <div className="w-full h-full bg-[linear-gradient(180deg,rgba(24,24,27,.9),rgba(14,14,16,.95))] border border-zinc-800 rounded-3xl p-8 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-zinc-800/80 pb-5 mb-6 shrink-0 relative z-10">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Play className="h-4 w-4 text-cyan-400 animate-pulse" />
            Agent Workflow
          </h2>
          <p className="text-[11px] text-zinc-500 font-light mt-1 uppercase tracking-wider">Automated Research Pipeline</p>
        </div>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[11px] font-bold border border-red-500/30 transition-all uppercase tracking-wider shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          Abort
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        <div className="flex flex-col gap-6 relative pb-4">
          {/* Global timeline track */}
          <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-zinc-800/50 rounded-full" />
          
          {pipelineSteps.map(({ step, label, desc, est }, idx) => {
            const state = getStepState(step);
            const isLast = idx === pipelineSteps.length - 1;

            // Icon & Glow styling
            let iconContainer = "";
            let cardStyle = "";
            let statusText = "";
            let lineStyle = "";

            if (state === 'completed') {
              iconContainer = "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
              cardStyle = "border-emerald-900/30 bg-emerald-950/5 hover:bg-emerald-950/10";
              statusText = "Completed";
              lineStyle = "bg-emerald-500";
            } else if (state === 'running') {
              iconContainer = "bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.4)] animate-pulse";
              cardStyle = "border-cyan-500/40 bg-cyan-950/20 shadow-[0_4px_20px_rgba(34,211,238,0.1)] hover:bg-cyan-950/30";
              statusText = "Running...";
              lineStyle = "bg-gradient-to-b from-cyan-400 to-transparent";
            } else if (state === 'error') {
              iconContainer = "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
              cardStyle = "border-red-900/50 bg-red-950/10 hover:bg-red-950/20";
              statusText = "Failed";
              lineStyle = "bg-red-500";
            } else {
              iconContainer = "bg-zinc-900 border-zinc-700 text-zinc-600";
              cardStyle = "border-zinc-800/60 bg-zinc-900/30 opacity-60 hover:opacity-100 hover:bg-zinc-900/50";
              statusText = "Pending";
              lineStyle = "bg-zinc-800/50";
            }

            return (
              <div key={step} className="relative flex items-start gap-4 group">
                {/* Node Icon */}
                <div className="relative z-10 flex flex-col items-center mt-1 ml-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${iconContainer} transition-all duration-500 relative`}>
                    {state === 'running' && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border border-cyan-400/50"
                      />
                    )}
                    {state === 'completed' && <Check className="h-4 w-4" />}
                    {state === 'running' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {state === 'error' && <AlertCircle className="h-4 w-4" />}
                    {state === 'pending' && <div className="h-2 w-2 rounded-full bg-zinc-700" />}
                  </div>
                  
                  {/* Animated Connecting Line (for completed or running) */}
                  {!isLast && (
                    <div className="absolute top-8 w-[2px] h-12 bg-zinc-800/50">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: state === 'completed' || state === 'running' ? 48 : 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className={`w-full ${state === 'running' ? 'bg-gradient-to-b from-cyan-400 to-transparent' : state === 'completed' ? 'bg-emerald-500' : ''}`}
                      />
                    </div>
                  )}
                </div>

                {/* Content Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className={`flex-1 p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md cursor-default shadow-sm ${cardStyle}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`text-[14px] font-semibold tracking-wide ${state === 'completed' ? 'text-emerald-50' : state === 'running' ? 'text-cyan-50' : 'text-zinc-200'}`}>
                      {label}
                    </h4>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                      state === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      state === 'running' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      state === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                      'text-zinc-500 bg-zinc-800/60 border-zinc-700/50'
                    }`}>
                      {statusText}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-400 leading-relaxed font-normal mb-4">
                    {desc}
                  </p>
                  
                  {/* Footer of Card */}
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>Est. {est}s</span>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Progress Card (Bottom Sticky) */}
      <div className="shrink-0 pt-4 mt-2 border-t border-zinc-800/80 z-10 relative bg-zinc-950/90 backdrop-blur-xl">
        <div className="p-5 bg-zinc-900/60 border border-zinc-700/50 rounded-2xl flex flex-col gap-3 shadow-lg hover:bg-zinc-900/80 transition-all duration-300">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white tracking-wide">Overall Progress</span>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-0.5">Est. Remaining</span>
              <span className="text-xs font-mono text-cyan-400">{remainingTime > 0 ? `~${remainingTime}s` : 'Complete'}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Progress bar subtle shimmer effect */}
                <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 font-medium text-right">
              {completedStepsCount} / {pipelineSteps.length} Completed
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.15);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
}
