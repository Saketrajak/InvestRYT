"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, User, Send, FileText, Activity } from 'lucide-react';
import type { ChatMessage } from '../hooks/useChat';
import type { CompanyProfile } from '../../types/index';

interface FloatingChatProps {
  messages: ChatMessage[];
  chatLoading: boolean;
  inputVal: string;
  onInputChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  onSuggestionClick: (suggestion: string) => void;
  chatSuggestions: string[];
  profile: CompanyProfile;
  persona: 'value' | 'growth' | 'bear';
  onPersonaChange: (persona: 'value' | 'growth' | 'bear') => void;
}

export default function FloatingChat({
  messages,
  chatLoading,
  inputVal,
  onInputChange,
  onSend,
  onSuggestionClick,
  chatSuggestions,
  profile,
  persona,
  onPersonaChange,
}: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const personaConfig = [
    { id: 'value', label: 'Value Bias', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' },
    { id: 'growth', label: 'Growth Bias', color: 'border-purple-500/30 text-purple-400 bg-purple-500/5' },
    { id: 'bear', label: 'Bear Case', color: 'border-red-500/30 text-red-400 bg-red-500/5' },
  ] as const;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[380px] h-[580px] bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-800 rounded-2xl flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-850 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white tracking-tight">AI Research Copilot</span>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{profile.ticker}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Persona Selector Bar */}
            <div className="px-4 py-2 border-b border-zinc-850 bg-zinc-950/40 flex justify-between gap-1.5 shrink-0 select-none">
              {personaConfig.map((p) => {
                const active = persona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onPersonaChange(p.id)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center border transition-all ${
                      active
                        ? p.color
                        : 'border-transparent text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900/40'
                    }`}
                  >
                    {p.id}
                  </button>
                );
              })}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-4 custom-scrollbar">
              <div className="flex flex-col self-start max-w-[90%]">
                <div className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl rounded-tl-sm text-[13px] font-light leading-relaxed text-zinc-300">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-850">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span className="text-[8px] uppercase tracking-widest font-black text-zinc-500">Executive Summary Loaded</span>
                  </div>
                  <p>
                    I have compiled the comprehensive equity research report for <strong className="text-white font-semibold">{profile.name}</strong>.
                  </p>
                  <p className="mt-2 text-zinc-400/80">
                    Select a bias (Value, Growth, or Bear) and ask follow-up questions to explore the stock further.
                  </p>
                </div>
              </div>

              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}
                  >
                    <div className={`p-4 rounded-2xl text-[13px] leading-relaxed font-light ${
                      isUser
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-500/20 text-white rounded-tr-sm shadow-md'
                        : 'bg-zinc-900/30 border border-zinc-800/60 text-zinc-300 rounded-tl-sm'
                    }`}>
                      <span className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-2.5 select-none ${isUser ? 'text-purple-400' : 'text-cyan-400'}`}>
                        {isUser ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3 animate-pulse" />}
                        {isUser ? 'Investor' : 'Copilot'}
                      </span>
                      <div className="whitespace-pre-line text-zinc-200 font-light text-[13px]">{m.content}</div>
                    </div>
                  </motion.div>
                );
              })}

              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-zinc-900/20 border border-zinc-850 text-zinc-400 p-4 rounded-2xl rounded-tl-sm self-start max-w-[88%] text-[13px] font-light flex items-center gap-3"
                >
                  <Activity className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span className="text-zinc-500 font-medium">Analyzing stock financials...</span>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="shrink-0 px-4 pb-4 pt-2">
              {messages.length === 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar" style={{ scrollbarWidth: 'none' }}>
                  {chatSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick(s)}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={onSend} className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 focus-within:border-zinc-700 rounded-xl px-3 py-1.5 transition-all">
                <input
                  type="text"
                  placeholder="Ask a follow-up query..."
                  value={inputVal}
                  onChange={(e) => onInputChange(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 bg-transparent border-none text-[13px] py-2 outline-none text-white font-light placeholder:text-zinc-650"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputVal.trim()}
                  className="p-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-600 text-white rounded-xl transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-13 h-13 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl shadow-purple-500/15 flex items-center justify-center transition-all duration-300"
      >
        {open ? <X className="h-5.5 w-5.5" /> : <MessageSquare className="h-5.5 w-5.5" />}
      </motion.button>
    </div>
  );
}
