"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useResearchAgent } from '../hooks/useResearchAgent';
import { useChat } from '../hooks/useChat';
import Header from '../components/Header';
import AgentPipeline from '../components/AgentPipeline';
import AgentTerminal from '../components/AgentTerminal';
import ReportSkeleton from '../components/ReportSkeleton';
import ReportDetails from '../components/reportDetails';
import FloatingChat from '../components/FloatingChat';
import { AlertTriangle } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('query') || '';
  const hasStarted = useRef(false);

  const {
    loading,
    error,
    currentStep,
    stepStatus,
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
    sendMessage,
    clearChat,
  } = useChat();

  const [pipelineCollapsed, setPipelineCollapsed] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [persona, setPersona] = useState<'value' | 'growth' | 'bear'>('value');

  useEffect(() => {
    if (query && !hasStarted.current) {
      hasStarted.current = true;
      runResearch(query);
    }
  }, [query, runResearch]);

  const handleNewResearch = () => {
    router.push('/');
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
    'What are the key risk factors?',
    'Summarize the news sentiment.',
    'Formulate a Bear Case scenario.',
  ];

  if (!query) {
    router.replace('/');
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full bg-[#09090b]">

      <Header showNewResearch onNewResearch={handleNewResearch} />

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

      <main className="flex-1 w-full relative z-10 flex overflow-hidden">
        <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
          <div className="w-full max-w-[1520px] h-full border-l border-r border-zinc-800/40" />
        </div>

        <div className="flex w-full max-w-[1520px] mx-auto h-full relative z-10 px-8 lg:px-10 pt-5 pb-5 gap-6">
          {/* Left: Collapsible Agent Pipeline */}
          <motion.div
            animate={{ width: pipelineCollapsed ? 52 : 260 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0 overflow-hidden"
          >
            <AgentPipeline
              collapsed={pipelineCollapsed}
              onToggleCollapse={() => setPipelineCollapsed(!pipelineCollapsed)}
              currentStep={currentStep}
              stepStatus={stepStatus}
              progressLog={progressLog}
              onCancel={cancelResearch}
            />
          </motion.div>

          {/* Main: Terminal (loading) or Report (complete) */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="terminal"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <AgentTerminal
                    currentStep={currentStep}
                    stepStatus={stepStatus}
                    progressLog={progressLog}
                  />
                </motion.div>
              ) : report && profile && financials && metrics ? (
                <motion.div
                  key="report"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full h-full bg-[#09090b] border border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                >
                  <ReportDetails
                    report={report}
                    profile={profile}
                    financials={financials}
                    metrics={metrics}
                    priceHistory={priceHistory}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <ReportSkeleton progressLog={progressLog} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Floating Chatbot */}
      {report && profile && (
        <FloatingChat
          messages={messages}
          chatLoading={chatLoading}
          inputVal={inputVal}
          onInputChange={setInputVal}
          onSend={handleSendChatMessage}
          onSuggestionClick={handleSuggestionClick}
          chatSuggestions={chatSuggestions}
          profile={profile}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#09090b]">
        <div className="text-zinc-500 text-sm font-medium">Loading research workspace...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
