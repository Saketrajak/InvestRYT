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
}: FloatingChatProps) {
  const [open, setOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[380px] h-[560px] bg-[rgba(18,18,20,.95)] backdrop-blur-2xl border border-[rgba(255,255,255,.08)] rounded-2xl flex flex-col shadow-[0_30px_80px_rgba(0,0,0,.6)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,.04)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[rgba(255,255,255,.03)] rounded-full border border-[rgba(255,255,255,.05)]">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white tracking-tight">AI Research Copilot</span>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">{profile.name}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 flex flex-col gap-4">
              <div className="flex flex-col self-start max-w-[90%]">
                <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] p-4 rounded-2xl rounded-tl-sm text-[13px] font-light leading-relaxed text-zinc-300">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[rgba(255,255,255,.05)]">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">Executive Summary Ready</span>
                  </div>
                  <p>
                    I have compiled the comprehensive equity research report for <strong className="text-white font-semibold">{profile.name}</strong>.
                  </p>
                  <p className="mt-2 text-zinc-500">
                    Ask follow-up questions to dive deeper.
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
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-[rgba(255,255,255,.08)] text-white rounded-tr-sm'
                        : 'bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] text-zinc-300 rounded-tl-sm'
                    }`}>
                      <span className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-2 ${isUser ? 'text-purple-300' : 'text-cyan-400'}`}>
                        {isUser ? <User className="h-2.5 w-2.5" /> : <Sparkles className="h-2.5 w-2.5" />}
                        {isUser ? 'You' : 'Copilot'}
                      </span>
                      <div className="whitespace-pre-line text-zinc-200 text-[13px]">{m.content}</div>
                    </div>
                  </motion.div>
                );
              })}

              {chatLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] text-zinc-400 p-4 rounded-2xl rounded-tl-sm self-start max-w-[88%] text-[13px] font-light flex items-center gap-3"
                >
                  <Activity className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                  <span>Analyzing request...</span>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 px-4 pb-4 pt-2">
              {messages.length === 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {chatSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSuggestionClick(s)}
                      className="px-3 py-1.5 bg-[rgba(255,255,255,.03)] hover:bg-[rgba(255,255,255,.08)] border border-[rgba(255,255,255,.05)] text-zinc-400 hover:text-white rounded-full text-[10px] font-medium transition-all shrink-0 whitespace-nowrap"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={onSend} className="flex items-center gap-2 bg-[rgba(255,255,255,.04)] border border-[rgba(255,255,255,.08)] focus-within:border-[rgba(255,255,255,.15)] rounded-xl px-3 py-1.5 transition-all">
                <input
                  type="text"
                  placeholder="Ask a follow-up..."
                  value={inputVal}
                  onChange={(e) => onInputChange(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 bg-transparent border-none text-[13px] py-2 outline-none text-white font-light placeholder:text-zinc-600"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !inputVal.trim()}
                  className="p-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 flex items-center justify-center transition-all"
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </motion.button>
    </div>
  );
}
