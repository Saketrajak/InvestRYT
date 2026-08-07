"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useChat } from '../hooks/useChat';
import Header from '../components/Header';
import ReportDetails from '../components/reportDetails';
import FloatingChat from '../components/FloatingChat';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticker = searchParams.get('ticker') || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  const {
    messages,
    chatLoading,
    sendMessage,
  } = useChat();

  const [chatInput, setChatInput] = useState('');
  const [persona, setPersona] = useState<'value' | 'growth' | 'bear'>('value');

  // Load report data from localStorage
  useEffect(() => {
    if (ticker) {
      setLoading(true);
      try {
        const cached = localStorage.getItem(`investryt_report_${ticker.toUpperCase()}`);
        if (cached) {
          setData(JSON.parse(cached));
        } else {
          setData(null);
        }
      } catch (err) {
        console.error('[ReportPage] Error reading from localStorage:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setData(null);
    }
  }, [ticker]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !data) return;
    const { profile, financials, metrics } = data;
    sendMessage(chatInput.trim(), profile.name, profile.ticker, { profile, financials, metrics }, persona);
    setChatInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (chatLoading || !data) return;
    const { profile, financials, metrics } = data;
    sendMessage(suggestion, profile.name, profile.ticker, { profile, financials, metrics }, persona);
  };

  const chatSuggestions = [
    'Explain the WACC and valuation metrics.',
    'What are the key risk factors?',
    'Summarize the news sentiment.',
    'Formulate a Bear Case scenario.',
  ];

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRerunResearch = () => {
    if (ticker) {
      router.push(`/search?query=${encodeURIComponent(ticker)}`);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#060608] text-zinc-400 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Retrieving investment report...</span>
        </div>
      </div>
    );
  }

  if (!ticker || !data) {
    return (
      <div className="min-h-[100dvh] bg-[#060608] text-zinc-300 flex flex-col relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none" />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-[#121214] border border-[#232326] rounded-2xl p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6"
          >
            <div className="p-4 bg-amber-500/5 rounded-full border border-amber-500/10">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Report Not Found</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-light">
                {ticker
                  ? `No compiled research report was found for "${ticker.toUpperCase()}" in your local session cache.`
                  : "No stock symbol was specified to load the report."}
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              {ticker && (
                <button
                  onClick={handleRerunResearch}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-widest shadow-lg shadow-purple-500/25"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Analyze {ticker.toUpperCase()} Now
                </button>
              )}
              <button
                onClick={handleGoHome}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[rgba(255,255,255,.02)] hover:bg-[rgba(255,255,255,.05)] text-zinc-400 hover:text-white rounded-xl text-xs font-bold border border-[rgba(255,255,255,.04)] transition-all uppercase tracking-widest"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Go Back to Search
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const { report, profile, financials, metrics, priceHistory } = data;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#060608] relative w-full text-zinc-300 overflow-x-hidden animate-fade-in">
      {/* Grid Pattern and Glows */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none z-0" />
      <Header showNewResearch onNewResearch={handleGoHome} />

      <main className="flex-1 relative z-10 w-full">
        <ReportDetails
          report={report}
          profile={profile}
          financials={financials}
          metrics={metrics}
          priceHistory={priceHistory}
        />
      </main>

      {/* Floating Chat Interface */}
      <FloatingChat
        messages={messages}
        chatLoading={chatLoading}
        inputVal={chatInput}
        onInputChange={setChatInput}
        onSend={handleSendChatMessage}
        onSuggestionClick={handleSuggestionClick}
        chatSuggestions={chatSuggestions}
        profile={profile}
        persona={persona}
        onPersonaChange={setPersona}
      />
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] bg-[#060608] text-zinc-500 text-sm font-medium flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <span>Initializing workspace...</span>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}
