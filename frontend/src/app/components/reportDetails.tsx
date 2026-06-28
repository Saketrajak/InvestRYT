"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type {
  ResearchReport,
  CompanyProfile,
  FinancialData,
  KeyMetrics,
  StockPriceEntry,
} from '../../types/index.js';
import {
  RevenueChart,
  StockPriceChart,
  RadarChart,
  MarginTrendChart,
} from './charts';
import DcfSimulator from './DcfSimulator';
import PeerComparison from './PeerComparison';
import PDFReportTemplate from './PDFReportTemplate';
import {
  Download, ExternalLink, Activity, Briefcase, Globe,
  LayoutDashboard, Table, BarChart4, Newspaper, ChevronRight,
  TrendingUp, TrendingDown, Target, Building2, MapPin, Users, CheckCircle, Percent,
  Send, Sparkles, Scale, Anchor, Lightbulb, ShieldAlert
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReportDetailsProps {
  report: ResearchReport;
  profile: CompanyProfile;
  financials: FinancialData;
  metrics: KeyMetrics;
  priceHistory: StockPriceEntry[];
}

type TabType = 'summary' | 'financials' | 'valuation' | 'peers' | 'news';

export default function ReportDetails({
  report,
  profile,
  financials,
  metrics,
  priceHistory,
}: ReportDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [exporting, setExporting] = useState(false);

  // Formatting Helpers
  const formatCurrency = (val: number | null | undefined, currency: string = 'INR') => {
    if (val === null || val === undefined) return 'N/A';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency + ' ';
    if (currency === 'INR') {
      if (abs >= 1e7) return `${sign}${sym}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${sym}${(abs / 1e5).toFixed(2)} L`;
      return `${sign}${sym}${abs.toLocaleString('en-IN')}`;
    } else {
      if (abs >= 1e9) return `${sign}${sym}${(abs / 1e9).toFixed(2)} B`;
      if (abs >= 1e6) return `${sign}${sym}${(abs / 1e6).toFixed(2)} M`;
      return `${sign}${sym}${abs.toLocaleString('en-US')}`;
    }
  };

  const formatPercentage = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    const isDecimal = Math.abs(val) < 1.0 && val !== 0;
    const finalVal = isDecimal ? val * 100 : val;
    return `${finalVal.toFixed(1)}%`;
  };

  const formatNumber = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toLocaleString();
  };

  // Premium High-Res PDF Export logic
  const handlePdfExport = async () => {
    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const container = document.getElementById('pdf-export-container');
      if (!container) throw new Error("Template missing");
      const pages = container.querySelectorAll('[id^="pdf-page-"]');
      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#09090b',
          logging: false,
          width: 1000,
          height: 1414,
          windowWidth: 1000,
        });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
      pdf.save(`${report.ticker.toUpperCase()}_Institutional_Research.pdf`);
    } catch (err) {
      console.error('[PDF Export] Failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Verdict configs
  const verdictConfig = {
    INVEST: { glow: 'shadow-[0_0_80px_rgba(52,211,153,0.3)]', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    PASS: { glow: 'shadow-[0_0_80px_rgba(248,113,113,0.3)]', text: 'text-red-400', border: 'border-red-500/30' },
    HOLD: { glow: 'shadow-[0_0_80px_rgba(251,191,36,0.3)]', text: 'text-amber-400', border: 'border-amber-500/30' },
    WATCHLIST: { glow: 'shadow-[0_0_80px_rgba(56,189,248,0.3)]', text: 'text-sky-400', border: 'border-sky-500/30' },
  };
  const currentVerdict = report.verdict.toUpperCase() as keyof typeof verdictConfig;
  const vd = verdictConfig[currentVerdict] || verdictConfig.HOLD;

  const navTabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'summary', label: 'Summary', icon: LayoutDashboard },
    { id: 'financials', label: 'Financials', icon: Activity },
    { id: 'valuation', label: 'Valuation', icon: Percent },
    { id: 'peers', label: 'Peers', icon: BarChart4 },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  return (
    <div className="w-full h-full min-w-0 bg-[#09090b] text-zinc-300 flex flex-col relative overflow-y-auto overflow-x-hidden pr-[420px]">
      
      {/* 1. HEADER & HERO RECOMMENDATION */}
      <div className="px-8 py-6 flex flex-col gap-6 relative min-w-0">
        <div className={`absolute top-0 right-0 w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none ${vd.glow}`} />
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 z-10 min-w-0">
          <div className="flex flex-col gap-4 w-full lg:max-w-2xl min-w-0">
            <div className="flex items-center gap-3 flex-wrap min-w-0">
              <span className="px-3 py-1 rounded-full bg-[rgba(255,255,255,.03)] border border-[rgba(255,255,255,.06)] text-[10px] font-bold text-zinc-400 uppercase tracking-widest backdrop-blur-md">
                {profile.exchange}:{profile.ticker}
              </span>
              <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider truncate">{profile.sector} &middot; {profile.industry}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tighter leading-none">
              {profile.name}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-500 font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {profile.country}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Market Cap: {formatCurrency(profile.marketCap, profile.currency)}</span>
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Employees: {formatNumber(profile.employees)}</span>
            </div>
          </div>

          <button
            onClick={handlePdfExport}
            disabled={exporting}
            className="group relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-400 hover:to-purple-500 text-white rounded-full text-xs font-bold transition-all shadow-[0_10px_30px_rgba(34,211,238,0.1)] hover:shadow-[0_10px_40px_rgba(168,85,247,0.3)] border border-[rgba(255,255,255,.1)] hover:border-transparent backdrop-blur-xl overflow-hidden disabled:opacity-50 shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            {exporting ? (
              <Activity className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Download className="h-4 w-4 text-cyan-400 group-hover:text-white transition-colors" />
            )}
            <span className="text-[10px] uppercase tracking-widest">
              {exporting ? 'Compiling PDF...' : 'Download PDF'}
            </span>
          </button>
        </div>

        {/* HERO RECOMMENDATION CARD */}
        <div className="w-full bg-[rgba(18,18,20,.68)] backdrop-blur-2xl border border-[rgba(255,255,255,.06)] rounded-2xl p-6 gap-6 flex flex-col lg:flex-row flex-wrap items-start justify-between shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10 relative min-w-0">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 opacity-40 rounded-t-2xl" />
          
          <div className="flex flex-col gap-3 flex-1 min-w-[220px]">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AI Investment Decision</span>
            <div className="flex items-center gap-4 min-w-0">
              <span className={`text-3xl lg:text-4xl xl:text-5xl font-black uppercase tracking-tighter ${vd.text}`}>{report.verdict}</span>
            </div>
            <p className="text-zinc-500 text-xs font-medium leading-relaxed">
              Based on {report.confidenceScore}% confidence interval across financial modeling, sentiment analysis, and moat evaluation.
            </p>
          </div>

          <div className="w-px h-24 bg-[rgba(255,255,255,.05)] hidden xl:block shrink-0" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-[2] min-w-[280px]">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold truncate">Current Price</span>
              <span className="text-xl lg:text-2xl font-bold text-white truncate">{formatCurrency(metrics.currentPrice, profile.currency)}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold truncate">Target Price</span>
              <span className="text-xl lg:text-2xl font-bold text-cyan-400 truncate">{formatCurrency(metrics.targetPrice, profile.currency)}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold truncate">Fair Value Est.</span>
              <span className="text-sm lg:text-base font-bold text-zinc-300 leading-tight truncate">{report.fairValueEstimate || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold truncate">Expected Upside</span>
              <span className={`text-xl lg:text-2xl font-black truncate ${((metrics.targetPrice || 0) > (metrics.currentPrice || 0)) ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.targetPrice && metrics.currentPrice 
                  ? formatPercentage((metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice) 
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STICKY TAB BAR */}
      <div className="sticky top-0 z-40 px-8 py-3 bg-[#09090b]/90 backdrop-blur-xl border-b border-[rgba(255,255,255,.04)] shadow-[0_10px_40px_rgba(0,0,0,0.5)] min-w-0 w-full">
        <div className="flex gap-2 overflow-x-auto no-scrollbar min-w-0 w-full">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2.5 whitespace-nowrap transition-all duration-300 ${
                  active
                    ? 'text-white shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-[rgba(255,255,255,.04)]'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors duration-300 ${active ? 'text-cyan-400' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[rgba(255,255,255,.06)] rounded-xl border border-[rgba(255,255,255,.1)] shadow-[0_0_30px_rgba(34,211,238,0.1)]"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-cyan-400 via-cyan-500 to-purple-500 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="px-8 py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full flex flex-col gap-8 min-w-0 bg-[rgba(18,18,20,.68)] backdrop-blur-2xl border border-[rgba(255,255,255,.06)] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            
            {/* -------------------------------------------------------- */}
            {/* EXECUTIVE SUMMARY                                        */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'summary' && (
              <>
                <div className="flex flex-col gap-4 w-full min-w-0">
                  <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> AI Investment Thesis
                  </h2>
                  <div className="prose prose-invert max-w-none text-base lg:text-lg text-zinc-300 leading-[1.7] font-light [&_h1]:text-white [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-cyan-400 [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1 [&_strong]:text-white [&_strong]:font-semibold [&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-cyan-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.investmentThesis}</ReactMarkdown>
                  </div>
                </div>

                <div className="flex flex-col gap-5 border-t border-[rgba(255,255,255,.04)] pt-8 min-w-0">
                  <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <Scale className="h-3.5 w-3.5" /> Investment Snapshot
                  </h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
                    {[
                      { label: 'P/E Ratio (TTM)', val: metrics.peRatio?.toFixed(1) || 'N/A' },
                      { label: 'Forward P/E', val: metrics.forwardPE?.toFixed(1) || 'N/A' },
                      { label: 'ROE', val: formatPercentage(metrics.roe) },
                      { label: 'ROCE', val: formatPercentage(metrics.roce) },
                      { label: 'Dividend Yield', val: formatPercentage(metrics.dividendYield) },
                      { label: 'Debt to Equity', val: metrics.debtToEquity?.toFixed(2) || 'N/A' },
                      { label: 'EV / EBITDA', val: metrics.evToEbitda?.toFixed(1) || 'N/A' },
                      { label: 'Beta', val: metrics.beta?.toFixed(2) || 'N/A' },
                    ].map((m, i) => (
                      <div key={i} className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] p-4 rounded-xl flex flex-col gap-1.5 hover:bg-[rgba(255,255,255,.04)] transition-colors">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">{m.label}</span>
                        <span className="text-xl font-bold text-white">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 border-t border-[rgba(255,255,255,.04)] pt-8 min-w-0">
                  <div className="flex flex-col gap-4 min-w-0">
                    <h2 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                      <Anchor className="h-3.5 w-3.5" /> Economic Moat
                    </h2>
                    <div className="text-sm lg:text-base text-zinc-400 leading-relaxed font-light [&_p]:mb-3 [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.moatAnalysis}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 min-w-0">
                    <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Lightbulb className="h-3.5 w-3.5" /> Growth Catalysts
                    </h2>
                    <ul className="flex flex-col gap-3 min-w-0">
                      {report.growthCatalysts.map((cat, idx) => (
                        <li key={idx} className="flex gap-3 p-4 rounded-xl bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] min-w-0">
                          <span className="text-emerald-400 font-bold shrink-0 text-sm">{idx + 1}.</span>
                          <span className="text-zinc-300 text-sm font-medium">{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* -------------------------------------------------------- */}
            {/* FINANCIALS & CHARTS                                      */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'financials' && (
              <>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 bg-[rgba(18,18,20,.68)] border border-[rgba(255,255,255,.06)] rounded-2xl p-5 min-w-0">
                    <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Revenue & EBITDA Trajectory</h2>
                    <div className="w-full h-[260px] min-w-0">
                      <RevenueChart years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()} revenues={financials.incomeStatements.map(i => i.revenue).reverse()} ebitdas={financials.incomeStatements.map(i => i.ebitda).reverse()} currency={profile.currency} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-4 bg-[rgba(18,18,20,.68)] border border-[rgba(255,255,255,.06)] rounded-2xl p-5 min-w-0">
                      <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Margin Expansion</h2>
                      <div className="w-full h-[260px] min-w-0">
                        <MarginTrendChart years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()} grossMargins={financials.incomeStatements.map(i => i.grossProfitRatio*100).reverse()} ebitdaMargins={financials.incomeStatements.map(i => (i.ebitda/(i.revenue||1))*100).reverse()} netMargins={financials.incomeStatements.map(i => i.netIncomeRatio*100).reverse()} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 bg-[rgba(18,18,20,.68)] border border-[rgba(255,255,255,.06)] rounded-2xl p-5 min-w-0">
                      <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Price Action</h2>
                      <div className="w-full h-[260px] min-w-0">
                         {priceHistory.length > 0 ? (
                            <StockPriceChart prices={priceHistory} ticker={profile.ticker} currency={profile.currency} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs">No Price Data Available</div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest">Historical Financial Statements</h2>
                  <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,.04)] bg-[rgba(255,255,255,.015)]">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-[rgba(255,255,255,.03)]">
                          <th className="p-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Metric ({profile.currency})</th>
                          {financials.incomeStatements.map(i => (
                            <th key={i.date} className="p-4 text-zinc-300 font-bold uppercase tracking-widest text-[10px] text-right">{i.date.slice(0,4)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,.04)]">
                        <tr>
                          <td className="p-4 text-zinc-400 font-medium text-xs">Revenue</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="p-4 text-right font-mono text-white text-xs">{formatCurrency(i.revenue, profile.currency)}</td>)}
                        </tr>
                        <tr>
                          <td className="p-4 text-zinc-400 font-medium text-xs">Operating Income</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="p-4 text-right font-mono text-zinc-300 text-xs">{formatCurrency(i.operatingIncome, profile.currency)}</td>)}
                        </tr>
                        <tr>
                          <td className="p-4 text-zinc-400 font-medium text-xs">Net Income</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="p-4 text-right font-mono text-cyan-400 font-bold text-xs">{formatCurrency(i.netIncome, profile.currency)}</td>)}
                        </tr>
                        <tr>
                          <td className="p-4 text-zinc-400 font-medium text-xs">Free Cash Flow</td>
                          {financials.cashFlows.map(i => <td key={i.date} className="p-4 text-right font-mono text-emerald-400 font-bold text-xs">{formatCurrency(i.freeCashFlow, profile.currency)}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'valuation' && (
              <div className="flex flex-col gap-8">
                <div className="bg-[rgba(18,18,20,.68)] border border-[rgba(255,255,255,.06)] rounded-2xl p-5">
                  <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-5">DCF Simulator</h2>
                  <DcfSimulator
                    initialFcf={financials.cashFlows[0]?.freeCashFlow || 0}
                    cash={financials.balanceSheets[0]?.cashAndEquivalents || 0}
                    debt={financials.balanceSheets[0]?.totalDebt || 0}
                    marketCap={profile.marketCap || 0}
                    currentPrice={metrics.currentPrice || 0}
                    currency={profile.currency}
                    market={profile.ticker.toUpperCase().endsWith('.NS') || profile.currency === 'INR' ? 'INDIA' : 'US'}
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest">AI Valuation Analysis</h2>
                  <div className="text-sm text-zinc-400 leading-relaxed font-light bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] p-5 rounded-xl [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.financialAnalysis.valuationAnalysis}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'peers' && (
              <div className="flex flex-col gap-8">
                <div className="bg-[rgba(18,18,20,.68)] border border-[rgba(255,255,255,.06)] rounded-2xl p-5">
                  <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-5">Peer Multiples</h2>
                  <PeerComparison targetTicker={profile.ticker} targetName={profile.name} targetMetrics={metrics} />
                </div>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="flex flex-col gap-10">
                
                <div className="flex flex-col gap-5">
                  <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5" /> Key Risk Factors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.riskFactors.map((r, idx) => {
                      const sev = r.severity.toUpperCase();
                      let bc = 'bg-zinc-800 text-zinc-400 border-zinc-700';
                      if (sev === 'HIGH') bc = 'bg-red-500/10 text-red-400 border-red-500/20';
                      if (sev === 'MEDIUM') bc = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      if (sev === 'LOW') bc = 'bg-green-500/10 text-green-400 border-green-500/20';
                      
                      return (
                        <div key={idx} className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] p-5 rounded-xl flex flex-col gap-3 min-w-0">
                           <span className={`self-start px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded-full border ${bc} shrink-0`}>
                              {sev} RISK
                           </span>
                           <p className="text-zinc-300 text-sm leading-relaxed font-light">{r.risk}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-5 border-t border-[rgba(255,255,255,.04)] pt-8">
                  <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Newspaper className="h-3.5 w-3.5" /> Market News & Sentiment
                  </h2>
                  <div className="text-zinc-400 text-sm font-light leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.newsSummary}</ReactMarkdown>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.newsItems.slice(0, 9).map((item, idx) => {
                      const sc = item.sentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-500/10' :
                                 item.sentiment === 'NEGATIVE' ? 'text-red-400 bg-red-500/10' : 'text-zinc-400 bg-zinc-800';
                      return (
                        <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="group bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.04)] hover:border-cyan-500/30 p-5 rounded-xl flex flex-col justify-between gap-3 transition-colors min-w-0">
                          <div className="flex flex-col gap-2 min-w-0">
                             <div className="flex justify-between items-start gap-2 min-w-0">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold truncate">{item.source}</span>
                                <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded-full shrink-0 ${sc}`}>{item.sentiment}</span>
                             </div>
                             <h4 className="text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors line-clamp-2">{item.title}</h4>
                             <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed font-light">{item.snippet}</p>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono shrink-0">{item.date}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Removed the Follow-up bar as per user request to keep input INSIDE the center panel only */}

      {/* Hidden PDF template */}
      <div className="absolute top-0 left-0 w-0 h-0 overflow-hidden opacity-0 pointer-events-none -z-50">
        <PDFReportTemplate report={report} profile={profile} financials={financials} metrics={metrics} priceHistory={priceHistory} />
      </div>

    </div>
  );
}
