"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import type { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Cpu, Activity, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AgentTerminalProps {
  currentStep: AgentStep | null;
  stepStatus: StepStatus;
  progressLog: ProgressLogEntry[];
}

export default function AgentTerminal({
  currentStep,
  stepStatus,
  progressLog,
}: AgentTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progressLog, currentStep]);

  return (
    <div className="w-full h-full bg-[rgba(18,18,20,.68)] backdrop-blur-xl border border-[rgba(255,255,255,.06)] rounded-3xl flex flex-col shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-hidden relative">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,.04)] shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(255,255,255,.03)] rounded-full border border-[rgba(255,255,255,.05)] shadow-inner">
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">AI Research Copilot</span>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em]">Live Execution Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(34,211,238,.1)] border border-[rgba(34,211,238,.2)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Synthesizing</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] backdrop-blur-md hidden sm:flex">
            <Cpu className="h-3 w-3 text-purple-400" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gemini 2.5</span>
          </div>
        </div>
      </div>

      {/* Progress Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-5 relative z-10 custom-scrollbar">
        <div className="flex flex-col gap-3">
          {progressLog.length === 0 && (
            <div className="flex items-center gap-3 text-zinc-500 text-sm font-light py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Initializing research pipeline...</span>
            </div>
          )}

          {progressLog.map((log, idx) => {
            const isCompleted = log.status === 'completed';
            const isRunning = log.status === 'running';
            const isError = log.status === 'error';

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-md border ${
                  isCompleted ? 'bg-[rgba(16,185,129,.05)] border-[rgba(16,185,129,.1)]' :
                  isRunning ? 'bg-[rgba(34,211,238,.06)] border-[rgba(34,211,238,.15)] shadow-[0_4px_20px_rgba(34,211,238,0.08)]' :
                  isError ? 'bg-[rgba(239,68,68,.05)] border-[rgba(239,68,68,.1)]' :
                  'bg-[rgba(255,255,255,.015)] border-[rgba(255,255,255,.03)]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-500/70" /> :
                   isRunning ? <Activity className="h-4 w-4 text-cyan-400 animate-pulse" /> :
                   isError ? <div className="h-2 w-2 rounded-full bg-red-500/60 mt-1" /> :
                   <div className="h-2 w-2 rounded-full bg-zinc-600 mt-1" />}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={`text-[13px] leading-relaxed font-light ${
                    isRunning ? 'text-white' : isError ? 'text-red-300' : 'text-zinc-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div ref={terminalEndRef} />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
      `}</style>
    </div>
  );
}
