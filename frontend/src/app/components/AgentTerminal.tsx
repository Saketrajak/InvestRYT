"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import type { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Cpu, Terminal, Sparkles, Loader2, RefreshCw } from 'lucide-react';

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

  // Color code log tags
  const formatLogMessage = (message: string) => {
    if (message.includes('Resolved to:')) {
      const parts = message.split('Resolved to:');
      return (
        <span>
          <span className="text-zinc-500">Resolved to: </span>
          <span className="text-cyan-400 font-semibold">{parts[1]}</span>
        </span>
      );
    }
    if (message.includes('Profile retrieved for')) {
      const parts = message.split('Profile retrieved for');
      return (
        <span>
          <span className="text-zinc-500">Profile retrieved for: </span>
          <span className="text-purple-400 font-semibold">{parts[1]}</span>
        </span>
      );
    }
    if (message.includes('Financial statements retrieved')) {
      const parts = message.split('statements retrieved');
      return (
        <span>
          <span className="text-zinc-500">Financial statements retrieved </span>
          <span className="text-emerald-400 font-semibold">{parts[1]}</span>
        </span>
      );
    }
    if (message.includes('Key metrics and price history')) {
      const parts = message.split('metrics and price history');
      return (
        <span>
          <span className="text-zinc-500">Key metrics & price history </span>
          <span className="text-pink-400 font-semibold">{parts[1]}</span>
        </span>
      );
    }
    if (message.includes('Completed moat and competition analysis')) {
      return (
        <span>
          <span className="text-zinc-500">Completed </span>
          <span className="text-amber-400 font-semibold">moat & competitor analysis</span>
        </span>
      );
    }
    if (message.includes('Completed news sentiment analysis')) {
      return (
        <span>
          <span className="text-zinc-500">Completed </span>
          <span className="text-teal-400 font-semibold">news sentiment weights scanner</span>
        </span>
      );
    }
    if (message.includes('Conducting institutional equity research')) {
      return (
        <span className="text-cyan-300 font-medium">
          Conducting institutional equity research and WACC modeling...
        </span>
      );
    }
    if (message.includes('Formatting investment report')) {
      return (
        <span className="text-purple-300 font-medium">
          Structuring compiled data into institutional investment dashboard...
        </span>
      );
    }
    return <span className="text-zinc-300">{message}</span>;
  };

  return (
    <div className="w-full h-full bg-[#0c0c0e]/85 backdrop-blur-2xl border border-zinc-800 rounded-3xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden relative">
      
      {/* Scanner effect bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-pulse z-20" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center">
            <Terminal className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">AI Research Engine Console</span>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-0.5">Live Execution Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {stepStatus === 'running' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Executing Node</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 backdrop-blur-md hidden sm:flex">
            <Cpu className="h-3.5 w-3.5 text-purple-400 animate-pulse" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Gemini 3.5 & Tavily</span>
          </div>
        </div>
      </div>

      {/* Terminal Log Output */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10 custom-scrollbar font-mono text-xs flex flex-col gap-3">
        {progressLog.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-600 font-light py-12">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            <span className="text-zinc-500 uppercase tracking-widest font-black text-[10px]">Initializing graph state...</span>
          </div>
        )}

        {progressLog.map((log, idx) => {
          const isCompleted = log.status === 'completed';
          const isRunning = log.status === 'running';
          const isError = log.status === 'error';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex items-start gap-3.5 px-4 py-3 rounded-xl border transition-all ${
                isCompleted ? 'bg-emerald-500/5 border-emerald-500/10' :
                isRunning ? 'bg-cyan-500/5 border-cyan-500/15 shadow-[0_2px_12px_rgba(6,182,212,0.05)]' :
                isError ? 'bg-red-500/5 border-red-500/10' :
                'bg-zinc-900/30 border-zinc-800/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isCompleted ? <span className="text-emerald-500 font-bold">&radic;</span> :
                 isRunning ? <span className="text-cyan-400 font-bold animate-pulse">&gt;</span> :
                 isError ? <span className="text-red-500 font-bold">!</span> :
                 <span className="text-zinc-700 font-bold">#</span>}
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between gap-1.5">
                <div className="leading-relaxed">
                  {formatLogMessage(log.message)}
                </div>
                <span className="text-[10px] text-zinc-600 font-mono shrink-0 select-none self-end sm:self-start">
                  [{log.timestamp}]
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Current Active Step indicator */}
        {stepStatus === 'running' && (
          <div className="text-cyan-400/90 flex items-center gap-2 mt-1 px-4 py-1 animate-pulse">
            <span>&gt; Running StateGraph node [{currentStep}]...</span>
            <span className="inline-block h-3.5 w-1.5 bg-cyan-400 animate-blink" />
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
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
