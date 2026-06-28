"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentStep, StepStatus } from '../../types/index.js';
import { ProgressLogEntry } from '../hooks/useResearchAgent';
import { Terminal, Cpu, Clock, CheckCircle2, CircleDashed, AlertTriangle, XCircle, ChevronDown, ChevronRight, Activity, Wifi } from 'lucide-react';

interface AgentTerminalProps {
  currentStep: AgentStep | null;
  stepStatus: StepStatus;
  progressLog: ProgressLogEntry[];
}

const LogItem = ({ log }: { log: ProgressLogEntry }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Derive styling and icons based on status
  let containerClass = "";
  let textClass = "";
  let Icon = CircleDashed;
  let iconClass = "";

  if (log.status === 'completed') {
    containerClass = "bg-emerald-950/10 border-emerald-900/30 hover:bg-emerald-950/20";
    textClass = "text-emerald-300";
    Icon = CheckCircle2;
    iconClass = "text-emerald-400";
  } else if (log.status === 'running') {
    containerClass = "bg-cyan-950/20 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]";
    textClass = "text-cyan-300";
    Icon = CircleDashed;
    iconClass = "text-cyan-400 animate-spin-slow";
  } else if (log.status === 'error') {
    containerClass = "bg-red-950/20 border-red-900/50 hover:bg-red-950/30";
    textClass = "text-red-300";
    Icon = XCircle;
    iconClass = "text-red-400";
  } else {
    // Treat 'pending' or 'warning' as muted
    containerClass = "bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900/50";
    textClass = "text-zinc-400";
    Icon = AlertTriangle;
    iconClass = "text-amber-500/70";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col p-3 rounded-xl border transition-all duration-300 backdrop-blur-sm ${containerClass}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 shrink-0">
            <Icon className={`h-4 w-4 ${iconClass}`} />
          </div>
          <span className={`leading-relaxed flex-1 font-mono tracking-tight ${textClass}`}>
            {log.message}
          </span>
        </div>
        <span className="text-zinc-500 text-[10px] shrink-0 font-medium pt-1 font-mono tabular-nums">{log.timestamp}</span>
      </div>
      
      {log.data && (
        <div className="mt-2 pl-7">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-all bg-zinc-950/50 hover:bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-800/50 hover:border-zinc-700 shadow-sm"
          >
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="font-semibold uppercase tracking-wider font-sans">JSON Payload</span>
          </button>
          
          <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <pre className="text-[10px] text-zinc-400 bg-[#050505] p-4 rounded-lg border border-zinc-800/80 overflow-x-auto whitespace-pre-wrap shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] custom-scrollbar font-mono">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function AgentTerminal({
  currentStep,
  stepStatus,
  progressLog,
}: AgentTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [timeStr, setTimeStr] = useState("00:00:00 UTC");

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progressLog, currentStep]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().split(" ")[4] + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[linear-gradient(180deg,rgba(24,24,27,.9),rgba(14,14,16,.95))] border border-zinc-800 rounded-3xl flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden font-mono relative">
      
      {/* Background Dot Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] z-0" 
           style={{ backgroundImage: 'radial-gradient(circle at center, #71717a 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
      />
      {/* Glowing accents */}
      <div className="absolute top-0 left-1/4 w-1/2 h-24 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none z-0" />

      {/* Terminal Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-md relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50" />
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Live Execution</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-semibold tracking-wider">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <Wifi className="h-3 w-3 text-emerald-400" />
            <span className="text-emerald-400/80">WSS Connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative z-10 custom-scrollbar text-[11px] scroll-smooth">
        <AnimatePresence initial={false}>
          {progressLog.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3 opacity-50">
              <Cpu className="h-8 w-8" />
              <p>Awaiting cognitive instructions...</p>
            </motion.div>
          ) : (
            progressLog.map((log, index) => (
              <LogItem key={index} log={log} />
            ))
          )}
        </AnimatePresence>
        <div ref={terminalEndRef} className="h-2" />
      </div>

      {/* Sticky Bottom Bar for Current Running Step */}
      {stepStatus === 'running' && currentStep && (
        <div className="shrink-0 px-5 py-3.5 bg-cyan-950/20 border-t border-cyan-900/30 flex items-center gap-3 relative z-20 backdrop-blur-md shadow-[0_-4px_20px_rgba(34,211,238,0.05)]">
          <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
          <div className="flex-1 text-[11px] text-cyan-300 font-medium flex items-center gap-2">
             <span className="uppercase tracking-wider opacity-70">Agent Processing:</span>
             <span className="font-bold">{currentStep}</span>
             <span className="inline-block h-3.5 w-1.5 bg-cyan-400 animate-blink shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
