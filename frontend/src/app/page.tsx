"use client";

// ============================================================
// Investryt AI — Dynamic Dual-Panel SPA Shell
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResearchAgent } from './hooks/useResearchAgent';
import { useChat } from './hooks/useChat';
import SearchHero from './components/SearchHero';
import AgentPipeline from './components/AgentPipeline';
import AgentTerminal from './components/AgentTerminal';
import ReportSkeleton from './components/ReportSkeleton';
import ReportDetails from './components/reportDetails';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Cpu,
  Send,
  MessageSquare,
  ChevronRight,
  TrendingDown,
  Activity,
  LogOut,
} from 'lucide-react';

export default function Home() {
  const {
    loading,
    error,
    currentStep,
    stepStatus,
    stepMessage,
    progressLog,
    report,
    profile,
    financials,
    metrics,
    priceHistory,
    runResearch,
    cancelResearch,
  } = useResearchAgent();

  const {
    messages,
    chatLoading,
    chatError,
    sendMessage,
    clearChat,
  } = useChat();

  const [inputVal, setInputVal] = useState('');
  const [persona, setPersona] = useState<'value' | 'growth' | 'bear'>('value');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatLoading]);

  const handleStartResearch = (query: string) => {
    clearChat();
    runResearch(query);
  };

  const handleNewResearch = () => {
    window.location.reload(); // Quick reset
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || chatLoading || !report || !profile) return;
    
    const context = { profile, financials, metrics };
    sendMessage(inputVal.trim(), profile.name, profile.ticker, context, persona);
    setInputVal('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (chatLoading || !report || !profile) return;
    const context = { profile, financials, metrics };
    sendMessage(suggestion, profile.name, profile.ticker, context, persona);
  };

  const chatSuggestions = [
    'Explain the WACC and valuation metrics.',
    'What are the key risk factors in detail?',
    'Give me a summary of the news sentiment.',
    'Formulate a Bear Case scenario for this stock.',
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full filter blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none z-0" />

      {/* GLOBAL GRID LINES */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-40">
        <div className="w-full max-w-[1400px] h-full border-l border-r border-zinc-700/60" />
      </div>

      {/* HEADER NAVBAR */}
      <div className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-2xl flex justify-center shadow-sm">
        <div className="w-full max-w-[1400px] relative h-24 flex items-center">
          
          {/* Left: Logo (Aligned to 1400px grid line) */}
          <div className="absolute left-0 flex items-center">
            <img src="/investryt.svg" alt="Investryt Logo" className="h-12 w-auto object-contain" />
          </div>

          <header className="w-full max-w-[1150px] mx-auto px-6 h-full flex justify-between items-center">
            {/* Invisible placeholder to keep header layout balanced */}
            <div className="w-[150px] shrink-0" />

            {/* Center: Navigation (Hidden on small screens) */}
            <nav className="hidden md:flex items-center gap-8">
            <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Research</button>
            <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Features</button>
            <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Documentation</button>
            <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">API</button>
            <button className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">GitHub</button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center">
            {(report || loading) ? (
              <button
                onClick={handleNewResearch}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
              >
                <RefreshCw className="h-4 w-4" />
                New Research
              </button>
            ) : (
              <button
                onClick={() => {
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) searchInput.focus();
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white rounded-full text-sm font-semibold transition-all shadow-lg shadow-purple-500/20"
              >
                Start Researching &rarr;
              </button>
            )}
          </div>
        </header>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="max-w-5xl mx-auto w-full px-4 mt-6">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 shadow-lg">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Pipeline Execution Error</h4>
              <p className="text-xs text-red-400/90 font-light mt-1">{error}</p>
              <button
                onClick={handleNewResearch}
                className="mt-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold transition-all uppercase tracking-wider"
              >
                Reset and Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* State A: Landing Page Search */}
          {!loading && !report ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.4 }}
              className="flex-1 w-full flex flex-col"
            >
              <SearchHero onSearch={handleStartResearch} loading={loading} />
            </motion.div>
          ) : (
            /* State B: Research Pipeline / Workspace (3-Column Layout) */
            <motion.div
              key="workspace"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }}
              className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto h-[calc(100vh-120px)] p-8 lg:p-8 gap-6 relative z-10"
            >
              
              {/* LEFT (25%) - Agent Pipeline */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full lg:w-[25%] h-full shrink-0"
              >
                <AgentPipeline
                  currentStep={currentStep}
                  stepStatus={stepStatus}
                  progressLog={progressLog}
                  onCancel={cancelResearch}
                />
              </motion.div>

              {/* CENTER (35%) - Terminal / Chat Console */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full lg:w-[35%] h-full shrink-0 flex flex-col gap-6"
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div key="terminal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                      <AgentTerminal
                        currentStep={currentStep}
                        stepStatus={stepStatus}
                        progressLog={progressLog}
                      />
                    </motion.div>
                  ) : (
                    <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full bg-[linear-gradient(180deg,rgba(24,24,27,.9),rgba(14,14,16,.95))] border border-zinc-800 rounded-3xl p-8 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden glass-reflection">
                  <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-900/80 rounded-xl border border-zinc-800 shadow-inner">
                        <MessageSquare className="h-4 w-4 text-teal-400" />
                      </div>
                      <span className="text-sm font-bold text-white tracking-wide">Research Assistant</span>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  </div>

                  {/* Persona Selector Row */}
                  <div className="py-3 flex gap-2 justify-between items-center text-[11px] font-bold z-10 relative">
                    <button
                      type="button"
                      onClick={() => setPersona('value')}
                      className={`flex-1 py-2 rounded-xl border transition-all text-center ${
                        persona === 'value'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm'
                          : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      🛡️ Value
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersona('growth')}
                      className={`flex-1 py-2 rounded-xl border transition-all text-center ${
                        persona === 'growth'
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-sm'
                          : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ⚡ Growth
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersona('bear')}
                      className={`flex-1 py-2 rounded-xl border transition-all text-center ${
                        persona === 'bear'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-sm'
                          : 'bg-zinc-900/30 border-zinc-800/50 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      🐻 Bear
                    </button>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-4 z-10 relative custom-scrollbar pr-2">
                    {/* Welcome Message */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 p-4 rounded-2xl text-xs font-light leading-relaxed text-zinc-400 shadow-inner">
                      I have compiled the comprehensive equity research report for <strong className="text-zinc-200">{profile?.name}</strong> on the workspace panel. 
                      You can ask me follow-up questions about its financial ratios, balance sheet leverage, or growth vectors.
                    </div>

                    {messages.map((m, idx) => {
                      const isUser = m.role === 'user';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[90%] rounded-2xl p-3.5 text-xs leading-normal font-light shadow-sm ${
                            isUser
                              ? 'bg-gradient-to-br from-teal-600/20 to-teal-900/20 border border-teal-500/20 text-white self-end rounded-br-none'
                              : 'bg-zinc-900/60 border border-zinc-800/50 text-zinc-300 self-start rounded-bl-none'
                          }`}
                        >
                          <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1.5 font-mono tracking-wider">
                            {isUser ? 'You' : 'Agent'}
                          </span>
                          <span className="whitespace-pre-line">{m.content}</span>
                        </div>
                      );
                    })}

                    {chatLoading && (
                      <div className="bg-zinc-900/60 border border-zinc-800/50 text-zinc-400 p-3.5 rounded-2xl rounded-bl-none self-start max-w-[90%] text-xs font-light animate-pulse flex items-center gap-3 shadow-sm">
                        <Activity className="h-4 w-4 animate-spin text-teal-400" />
                        <span>Agent is compiling data...</span>
                      </div>
                    )}

                    {chatError && (
                      <div className="text-red-400 text-[11px] self-center flex items-center gap-1.5 bg-red-950/30 px-3 py-1.5 rounded-lg border border-red-900/50">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>{chatError}</span>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggestion Chips */}
                  {messages.length === 0 && (
                    <div className="py-2 flex flex-col gap-2 z-10 relative">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider pl-1">Suggested Prompts</span>
                      <div className="flex flex-col gap-1.5">
                        {chatSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            className="text-left px-4 py-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/50 hover:border-zinc-700/50 text-zinc-400 hover:text-zinc-200 rounded-xl text-[11px] font-medium transition-all truncate shadow-sm"
                          >
                            &gt; {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Form Box */}
                  <form onSubmit={handleSendChatMessage} className="pt-4 border-t border-zinc-800/80 flex gap-2 z-10 relative">
                    <input
                      type="text"
                      placeholder="Ask follow-up details..."
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 bg-zinc-900/50 border border-zinc-800/80 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 rounded-xl text-xs px-4 py-3 outline-none text-white font-light transition-all shadow-inner"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={chatLoading || !inputVal.trim()}
                      className="px-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all shadow-lg"
                    >
                      <Send className="h-4 w-4" />
                    </motion.button>
                  </form>

                  <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                      width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                      background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                      background: rgba(255, 255, 255, 0.2);
                    }
                  `}</style>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

              {/* RIGHT (40%) - Report Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full lg:w-[40%] h-full shrink-0"
              >
                <AnimatePresence mode="wait">
                  {report && profile && financials && metrics ? (
                    <motion.div key="report" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full h-full bg-[linear-gradient(180deg,rgba(24,24,27,.9),rgba(14,14,16,.95))] border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] glass-reflection">
                      <div className="w-full h-full overflow-y-auto">
                        <ReportDetails
                          report={report}
                          profile={profile}
                          financials={financials}
                          metrics={metrics}
                          priceHistory={priceHistory}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                      <ReportSkeleton progressLog={progressLog} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER (Only shown on search landing page to keep workspace full height) */}
      {!loading && !report && (
        <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4 z-20 relative">
          <div>
            © 2026 Investryt AI. All rights reserved. Developed for InsideIIM × Altuni AI Labs.
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Powered by Gemini 2.5 & Tavily Search Engines
          </div>
        </footer>
      )}
    </div>
  );
}
