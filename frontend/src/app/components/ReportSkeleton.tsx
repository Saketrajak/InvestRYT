"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, BarChart4, Newspaper, FileSpreadsheet } from 'lucide-react';
import { ProgressLogEntry } from '../hooks/useResearchAgent';

interface ReportSkeletonProps {
  progressLog?: ProgressLogEntry[];
}

export default function ReportSkeleton({ progressLog = [] }: ReportSkeletonProps) {
  return (
    <div className="w-full h-full bg-[linear-gradient(180deg,rgba(24,24,27,.9),rgba(14,14,16,.95))] border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden glass-reflection">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <div className="flex flex-col items-center text-center z-10 w-full max-w-md">
        
        {/* Large AI Logo with animated pulse */}
        <div className="relative mb-10">
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-cyan-500/40 rounded-full blur-xl"
          />
          <div className="relative bg-zinc-950 border border-zinc-800/80 p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
            <Cpu className="w-14 h-14 text-cyan-400" />
          </div>
        </div>

        {/* Headings */}
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl font-extrabold text-white mb-4 tracking-tight"
        >
          Preparing Institutional Research Workspace
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-zinc-400 font-light text-[15px] mb-12 leading-relaxed"
        >
          Financial models, valuation engines and sentiment analysis are initializing.
        </motion.p>

        {/* 3 Placeholder Cards */}
        <div className="flex flex-col w-full gap-4">
          <CardItem icon={BarChart4} title="Valuation Engine" delay={0.3} />
          <CardItem icon={Newspaper} title="News Intelligence" delay={0.4} />
          <CardItem icon={FileSpreadsheet} title="Financial Statements" delay={0.5} />
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
      className="flex items-center justify-between p-5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-zinc-800/60 rounded-xl border border-zinc-700/50">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <span className="text-[13px] font-semibold tracking-wide text-zinc-200">{title}</span>
      </div>
      
      {/* Loading Animation (AI Thinking Dots) */}
      <div className="flex gap-1.5 items-center mr-2">
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
