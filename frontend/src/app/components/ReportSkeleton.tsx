"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, BarChart4, Newspaper, FileSpreadsheet } from 'lucide-react';
import type { ProgressLogEntry } from '../hooks/useResearchAgent';

interface ReportSkeletonProps {
  progressLog?: ProgressLogEntry[];
}

export default function ReportSkeleton({ progressLog = [] }: ReportSkeletonProps) {
  return (
    <div className="w-full h-full bg-[rgba(18,18,20,.68)] backdrop-blur-xl border border-[rgba(255,255,255,.06)] rounded-3xl flex flex-col shadow-[0_20px_80px_rgba(0,0,0,.45)] overflow-hidden relative">

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(255,255,255,.04)] shrink-0 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(255,255,255,.03)] rounded-full border border-[rgba(255,255,255,.05)] shadow-inner">
            <Cpu className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Research Workspace</span>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.2em]">Generating Report</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="flex flex-col items-center text-center w-full max-w-xs">

          {/* Animated Logo */}
          <div className="relative mb-8">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-cyan-500/30 rounded-full blur-xl"
            />
            <div className="relative bg-zinc-950 border border-zinc-800/80 p-5 rounded-2xl shadow-2xl backdrop-blur-xl">
              <Cpu className="w-10 h-10 text-cyan-400" />
            </div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg font-extrabold text-white mb-2 tracking-tight"
          >
            Preparing Institutional Research
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-500 font-light text-xs mb-8 leading-relaxed"
          >
            Financial models, valuation engines and sentiment analysis are initializing.
          </motion.p>

          <div className="flex flex-col w-full gap-3">
            <CardItem icon={BarChart4} title="Valuation Engine" delay={0.3} />
            <CardItem icon={Newspaper} title="News Intelligence" delay={0.4} />
            <CardItem icon={FileSpreadsheet} title="Financial Statements" delay={0.5} />
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-6 py-4 border-t border-[rgba(255,255,255,.04)] relative z-10">
        <div className="w-full h-1.5 bg-[rgba(255,255,255,.03)] rounded-full overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/3 bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-pink-500/40 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function CardItem({ icon: Icon, title, delay }: { icon: any, title: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-zinc-300">{title}</span>
      </div>

      <div className="flex gap-1.5 items-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
        />
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.6)]"
        />
      </div>
    </motion.div>
  );
}
