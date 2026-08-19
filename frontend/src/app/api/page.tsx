"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { 
  Terminal, Code2, Link2, Copy, Check, Zap, Server, Shield
} from 'lucide-react';

const apiEndpoints = [
  {
    method: 'GET',
    path: '/health',
    desc: 'Verify the health status and uptime of the backend service agent.',
    params: [],
    response: `{
  "status": "healthy",
  "service": "Investryt AI Backend"
}`,
    code: {
      curl: `curl -X GET http://localhost:5000/health`,
      nodejs: `fetch('http://localhost:5000/health')
  .then(res => res.json())
  .then(data => console.log(data));`
    }
  },
  {
    method: 'GET',
    path: '/api/research',
    desc: 'Streams real-time Server-Sent Events (SSE) detailing node executions and outputs a completed company research report on completion.',
    params: [
      { name: 'query', type: 'string', required: true, desc: 'Stock exchange ticker symbol or company name (e.g., "AAPL", "Reliance").' }
    ],
    response: `// Event stream updates:
event: step
data: {"step": "resolve", "status": "running"}

event: log
data: "Resolved search 'Apple' to Symbol 'AAPL' on NASDAQ exchange."

event: report
data: {
  "profile": { "ticker": "AAPL", "name": "Apple Inc." },
  "report": { "recommendation": "INVEST", "score": 85 },
  "financials": { ... },
  "metrics": { ... }
}`,
    code: {
      curl: `curl -N http://localhost:5000/api/research?query=AAPL`,
      nodejs: `const eventSource = new EventSource(
  'http://localhost:5000/api/research?query=AAPL'
);

eventSource.addEventListener('step', (e) => {
  const stepData = JSON.parse(e.data);
  console.log('Current Step:', stepData.step);
});

eventSource.addEventListener('report', (e) => {
  const finalReport = JSON.parse(e.data);
  console.log('Final Valuation:', finalReport.report.recommendation);
  eventSource.close();
});`
    }
  }
];

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState<Record<number, 'curl' | 'nodejs'>>({
    0: 'curl',
    1: 'curl'
  });
  const [copiedIndex, setCopiedIndex] = useState<Record<number, boolean>>({});

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(prev => ({ ...prev, [idx]: true }));
    setTimeout(() => {
      setCopiedIndex(prev => ({ ...prev, [idx]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative w-full bg-[#09090b]">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-10">
        <div className="w-full max-w-[1280px] h-full border-l border-r border-zinc-700/30 opacity-30" />
      </div>

      <Header />

      <main className="flex-1 site-container relative z-20 py-12 md:py-20">
        {/* Title Hero */}
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Code2 className="h-3 w-3" /> REST &amp; SSE Endpoints
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-white mb-4 tracking-tight"
          >
            Investryt AI Developer API
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-base font-light leading-relaxed"
          >
            Access fundamental financials, competitor moat evaluations, market sentiments, and DCF metrics programmatically from our sandboxed backend server.
          </motion.p>
        </div>

        {/* Info Banner */}
        <section className="mb-12 border border-zinc-800/80 bg-zinc-950/40 rounded-2xl p-6 flex items-start gap-4 shadow-xl">
          <Server className="h-6 w-6 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold text-white">Target Base Server URL</h4>
            <p className="text-xs text-zinc-400 font-mono">http://localhost:5000</p>
            <p className="text-xs text-zinc-500 font-light leading-relaxed">
              For security, CORS is configured to accept wildcard origins during local testing. For production deployments, update the server initialization values in `app.ts` to restrict domains.
            </p>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="space-y-10">
          {apiEndpoints.map((endpoint, idx) => {
            const currentCodeText = activeTab[idx] === 'curl' ? endpoint.code.curl : endpoint.code.nodejs;
            return (
              <div 
                key={idx}
                className="border border-zinc-800 bg-zinc-950/20 rounded-3xl p-6 md:p-8 shadow-xl"
              >
                {/* Endpoint Header */}
                <div className="flex flex-wrap items-center gap-3 border-b border-zinc-800/60 pb-5 mb-6">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {endpoint.method}
                  </span>
                  <span className="font-mono text-base font-bold text-white tracking-tight">
                    {endpoint.path}
                  </span>
                  <p className="w-full text-zinc-400 text-sm font-light mt-2 leading-relaxed">
                    {endpoint.desc}
                  </p>
                </div>

                {/* Parameters (if any) */}
                {endpoint.params.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xs font-mono uppercase text-zinc-500 tracking-wider mb-3">Query Parameters</h4>
                    <div className="border border-zinc-800 rounded-xl overflow-hidden text-xs">
                      <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 text-zinc-400 font-semibold grid grid-cols-12 gap-4">
                        <div className="col-span-3">Parameter</div>
                        <div className="col-span-2">Type</div>
                        <div className="col-span-2">Required</div>
                        <div className="col-span-5">Description</div>
                      </div>
                      {endpoint.params.map((p, pIdx) => (
                        <div key={pIdx} className="px-4 py-3 border-b border-zinc-800 last:border-0 text-zinc-300 font-light grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3 font-mono text-teal-400 font-semibold">{p.name}</div>
                          <div className="col-span-2 font-mono text-zinc-500">{p.type}</div>
                          <div className="col-span-2 font-mono text-amber-500 font-semibold">{p.required ? 'Yes' : 'No'}</div>
                          <div className="col-span-5 text-zinc-400">{p.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Tabs & Snippet */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Code Request Block */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Example Request</h4>
                      <div className="flex gap-2 bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800/80">
                        <button
                          onClick={() => setActiveTab(prev => ({ ...prev, [idx]: 'curl' }))}
                          className={`px-2 py-1 text-2xs font-mono rounded-md transition-colors ${
                            activeTab[idx] === 'curl' 
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/15' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          cURL
                        </button>
                        <button
                          onClick={() => setActiveTab(prev => ({ ...prev, [idx]: 'nodejs' }))}
                          className={`px-2 py-1 text-2xs font-mono rounded-md transition-colors ${
                            activeTab[idx] === 'nodejs' 
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/15' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          Node.js
                        </button>
                      </div>
                    </div>

                    <div className="border border-zinc-800 rounded-2xl bg-zinc-950/40 p-4 font-mono text-[11px] leading-relaxed text-zinc-300 relative group overflow-x-auto min-h-[140px] flex flex-col justify-between">
                      <pre className="whitespace-pre">{currentCodeText}</pre>
                      <button
                        onClick={() => handleCopy(currentCodeText, idx)}
                        className="absolute right-3 top-3 p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy to Clipboard"
                      >
                        {copiedIndex[idx] ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Code Response Block */}
                  <div className="lg:col-span-6 space-y-3">
                    <h4 className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Example Response</h4>
                    <div className="border border-zinc-800 rounded-2xl bg-zinc-950/40 p-4 font-mono text-[11px] leading-relaxed text-zinc-400 overflow-x-auto min-h-[140px]">
                      <pre className="whitespace-pre">{endpoint.response}</pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#09090b] border-t border-[#232326] px-6 py-6 text-center text-xs text-zinc-600 font-light flex flex-col sm:flex-row justify-between items-center gap-4 z-20 relative">
        <div className="site-container flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            &copy; 2026 Investryt AI. All rights reserved. Developed for InsideIIM &times; Altuni AI Labs.
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Zap className="h-3.5 w-3.5 text-teal-400" />
            Powered by Gemini 2.5 &amp; Tavily Search Engines
          </div>
        </div>
      </footer>
    </div>
  );
}
