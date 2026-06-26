"use client";

// ============================================================
// Investryt AI — Dynamic Dual-Panel SPA Shell
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useResearchAgent } from './hooks/useResearchAgent';
import { useChat } from './hooks/useChat';
import SearchHero from './components/SearchHero';
import AgentProgress from './components/AgentProgress';
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
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-[#232326] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-[#141416] border border-[#232326] rounded-lg shadow-md">
            <Cpu className="h-4 w-4 text-teal-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Investryt <span className="text-teal-400">AI</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase ml-2 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
              Artifact Workspace
            </span>
          </div>
        </div>

        {(report || loading) && (
          <button
            onClick={handleNewResearch}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#232326] hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            New Research
          </button>
        )}
      </header>

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
        {/* State A: Landing Page Search */}
        {!loading && !report && (
          <SearchHero onSearch={handleStartResearch} loading={loading} />
        )}

        {/* State B: Research Pipeline / Workspace (Split Panel layout) */}
        {(loading || report) && (
          <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-70px)] border-t border-[#232326]">
            
            {/* LEFT PANEL: Log Stream (loading) OR Chat Console (complete) */}
            <div className="w-full lg:w-[400px] border-r border-[#232326] bg-[#0c0c0e] flex flex-col h-full shrink-0">
              
              {loading ? (
                // 1. Loading Step Progress Logs
                <div className="flex-1 overflow-y-auto p-5">
                  <AgentProgress
                    currentStep={currentStep}
                    stepStatus={stepStatus}
                    stepMessage={stepMessage}
                    progressLog={progressLog}
                    onCancel={cancelResearch}
                  />
                </div>
              ) : (
                // 2. Chat Console Dialog
                <div className="flex flex-col h-full">
                  <div className="px-5 py-4 border-b border-[#232326] bg-[#101012] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-teal-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Research Assistant</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  {/* Persona Selector Row */}
                  <div className="px-3 py-2 bg-[#141416]/40 border-b border-[#232326] flex gap-1 justify-between items-center text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPersona('value')}
                      className={`flex-1 py-1.5 rounded-lg border transition-all text-center ${
                        persona === 'value'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-sm'
                          : 'border-transparent hover:border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      🛡️ Value
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersona('growth')}
                      className={`flex-1 py-1.5 rounded-lg border transition-all text-center ${
                        persona === 'growth'
                          ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 shadow-sm'
                          : 'border-transparent hover:border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ⚡ Growth
                    </button>
                    <button
                      type="button"
                      onClick={() => setPersona('bear')}
                      className={`flex-1 py-1.5 rounded-lg border transition-all text-center ${
                        persona === 'bear'
                          ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-sm'
                          : 'border-transparent hover:border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      🐻 Bear
                    </button>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {/* Welcome Message */}
                    <div className="bg-[#141416]/50 border border-[#232326] p-4 rounded-xl text-xs font-light leading-relaxed text-zinc-400">
                      I have compiled the comprehensive equity research report for **{profile?.name}** on the workspace panel. 
                      You can ask me follow-up questions about its financial ratios, balance sheet leverage, or growth vectors.
                    </div>

                    {messages.map((m, idx) => {
                      const isUser = m.role === 'user';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-normal font-light ${
                            isUser
                              ? 'bg-teal-600/10 border border-teal-500/20 text-white self-end rounded-br-none'
                              : 'bg-[#141416] border border-[#232326] text-zinc-300 self-start rounded-bl-none'
                          }`}
                        >
                          <span className="text-[9px] text-zinc-500 font-bold uppercase mb-1 font-mono">
                            {isUser ? 'You' : 'Agent'}
                          </span>
                          <span className="whitespace-pre-line">{m.content}</span>
                        </div>
                      );
                    })}

                    {chatLoading && (
                      <div className="bg-[#141416] border border-[#232326] text-zinc-400 p-3 rounded-2xl rounded-bl-none self-start max-w-[85%] text-xs font-light animate-pulse flex items-center gap-2">
                        <Activity className="h-4.5 w-4.5 animate-spin text-teal-400" />
                        <span>Agent is compiling data...</span>
                      </div>
                    )}

                    {chatError && (
                      <div className="text-red-400 text-[10px] self-center flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{chatError}</span>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Suggestion Chips */}
                  {messages.length === 0 && (
                    <div className="px-5 py-2 flex flex-col gap-1.5">
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Suggested Prompts</span>
                      <div className="flex flex-col gap-1">
                        {chatSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(s)}
                            className="text-left px-3 py-1.5 bg-[#141416] hover:bg-[#1b1b1e] border border-[#232326] text-zinc-400 hover:text-white rounded-lg text-[10px] font-medium transition-all truncate"
                          >
                            &gt; {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input Form Box */}
                  <form onSubmit={handleSendChatMessage} className="p-4 border-t border-[#232326] bg-[#101012] flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask follow-up details..."
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      disabled={chatLoading}
                      className="flex-1 bg-[#09090b] border border-[#232326] focus:border-teal-500 rounded-lg text-xs px-3 py-2.5 outline-none text-white font-light"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !inputVal.trim()}
                      className="px-3 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* RIGHT PANEL: Live Research Output Artifact Dashboard */}
            <div className="flex-1 overflow-y-auto h-full bg-[#09090b]">
              {report && profile && financials && metrics ? (
                <ReportDetails
                  report={report}
                  profile={profile}
                  financials={financials}
                  metrics={metrics}
                  priceHistory={priceHistory}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500 gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-[#141416] border border-[#232326] rounded-xl shadow-lg animate-pulse">
                    <Sparkles className="h-6 w-6 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Gearing up the Investment War Room</h3>
                    <p className="text-xs text-zinc-500 font-light mt-1">Right-hand interactive financial terminal will render details upon pipeline compile.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* FOOTER (Only shown on search landing page to keep workspace full height) */}
      {!loading && !report && (
        <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4">
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
