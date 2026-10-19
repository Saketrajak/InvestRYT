"use client";

// ============================================================
// Investryt AI — Premium Investment Report Dashboard (Refined)
// ============================================================

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
  MarginTrendChart,
} from './charts';
import DcfSimulator from './DcfSimulator';
import PeerComparison from './PeerComparison';
import PDFReportTemplate from './PDFReportTemplate';
import {
  Download, Activity, Briefcase, LayoutDashboard,
  Table, BarChart4, Newspaper,
  TrendingUp, TrendingDown, MapPin, Users, Percent,
  Sparkles, Scale, Anchor, Lightbulb, ShieldAlert, BookOpen
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
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
  const [exportPageIndex, setExportPageIndex] = useState<number | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

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

  // Institutional Multi-Page PDF Export Logic (Sequential Active-Page Capture)
  const handlePdfExport = async () => {
    setExporting(true);
    setExportStatus('Initializing 7-Page Institutional Dossier...');
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const totalPages = 7;
      const pageTitles = [
        'Executive Decision Cover',
        'Strategic Thesis & Economic Moat',
        '5-Year Historical Statements & Margins',
        'Balance Sheet Architecture & Cash Flows',
        'DCF Intrinsic Valuation Model',
        'Sector Peer Benchmarking Multiples Matrix',
        'Risk Factors, News Sentiment & Disclosures'
      ];

      for (let p = 1; p <= totalPages; p++) {
        setExportStatus(`Compiling Page ${p} of ${totalPages}: ${pageTitles[p - 1]}...`);
        setExportPageIndex(p);

        // Allow React to re-render the single active page at standard (0, 0) coordinates
        await new Promise((resolve) => setTimeout(resolve, 300));

        const pageEl = document.getElementById(`pdf-page-${p}`);
        if (!pageEl) {
          throw new Error(`Failed to locate target page element: pdf-page-${p}`);
        }

        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 1000,
          height: 1414,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1000,
          windowHeight: 1414,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (p > 1) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      setExportStatus('Finalizing & Saving PDF Dossier...');
      const tickerClean = (report.ticker || 'STOCK').toUpperCase();
      pdf.save(`${tickerClean}_Institutional_Research_Dossier.pdf`);
    } catch (err: any) {
      console.error('[PDF Export] Failed:', err);
      alert('PDF generation encountered an error: ' + (err?.message || err));
    } finally {
      setExporting(false);
      setExportPageIndex(null);
      setExportStatus(null);
    }
  };

  // Verdict configurations
  const verdictConfig = {
    INVEST: {
      glow: 'shadow-[0_0_80px_rgba(16,185,129,0.06)] border-emerald-500/20',
      text: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tag: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    PASS: {
      glow: 'shadow-[0_0_80px_rgba(239,68,68,0.06)] border-red-500/20',
      text: 'text-red-400 bg-red-500/10 border-red-500/20',
      tag: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    HOLD: {
      glow: 'shadow-[0_0_80px_rgba(245,158,11,0.06)] border-amber-500/20',
      text: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tag: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    WATCHLIST: {
      glow: 'shadow-[0_0_80px_rgba(56,189,248,0.06)] border-sky-500/20',
      text: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      tag: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    },
  };
  const currentVerdict = report.verdict.toUpperCase() as keyof typeof verdictConfig;
  const vd = verdictConfig[currentVerdict] || verdictConfig.HOLD;

  const navTabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'summary', label: 'Summary', icon: LayoutDashboard },
    { id: 'financials', label: 'Financials', icon: Table },
    { id: 'valuation', label: 'Valuation', icon: Percent },
    { id: 'peers', label: 'Peers', icon: BarChart4 },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  return (
    <div className="w-full flex flex-col relative min-w-0">
      
      {/* 1. Header & Hero Metrics Section */}
      <div className="site-container pt-6 sm:pt-8 pb-6 flex flex-col gap-6 sm:gap-8 min-w-0 relative z-10">
        
        {/* COMPANY HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-5 sm:gap-6 relative min-w-0">
          <div className="flex flex-col gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[12px] font-bold text-zinc-400 uppercase tracking-widest backdrop-blur-md">
                {profile.exchange}:{profile.ticker}
              </span>
              <span className="h-1 w-1 rounded-full bg-zinc-800" />
              <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">{profile.sector}</span>
              <span className="h-1 w-1 rounded-full bg-zinc-800" />
              <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">{profile.industry}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-white tracking-tight leading-[1.1] select-all">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-500 shrink-0" /> {profile.country}</span>
              <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-zinc-500 shrink-0" /> Market Cap: {formatCurrency(profile.marketCap, profile.currency)}</span>
              <span className="flex items-center gap-2"><Users className="h-4 w-4 text-zinc-500 shrink-0" /> Employees: {formatNumber(profile.employees)}</span>
            </div>
          </div>

          {/* Download PDF button (Aligned to header row) */}
          <button
            onClick={handlePdfExport}
            disabled={exporting}
            className="group flex items-center justify-center gap-2 h-11 px-5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md shadow-purple-500/10 cursor-pointer shrink-0 self-stretch xl:self-auto"
          >
            {exporting ? (
              <Activity className="h-3.5 w-3.5 animate-spin text-cyan-300" />
            ) : (
              <Download className="h-3.5 w-3.5 text-cyan-300 group-hover:text-white transition-colors" />
            )}
            <span>{exportStatus || 'Download PDF Report'}</span>
          </button>
        </div>

        {/* HERO METRICS GRID */}
        <div className="grid grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch w-full">
          
          {/* Verdict Card */}
          <div className={`col-span-12 lg:col-span-4 bg-[#0c0c0e]/60 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between min-h-[160px] relative backdrop-blur-2xl ${vd.glow}`}>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-widest ${vd.tag}`}>
                {report.verdict}
              </span>
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Decision Verdict</span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">AI Investment Verdict</h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-light mt-2 leading-relaxed">
                Calculated with <strong className="text-white font-semibold">{report.confidenceScore}%</strong> confidence based on multi-agent financial modeling.
              </p>
            </div>
          </div>

          {/* Current Price */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Current Price</span>
            <div className="mt-auto">
              <span className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white tracking-tight leading-none block truncate">
                {formatCurrency(metrics.currentPrice, profile.currency)}
              </span>
              <span className="text-[11px] text-zinc-500 font-light mt-2 block uppercase tracking-wider">{profile.currency}</span>
            </div>
          </div>

          {/* Target Price */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Target Price</span>
            <div className="mt-auto">
              <span className="text-2xl sm:text-3xl lg:text-[32px] font-black text-cyan-400 tracking-tight leading-none block truncate">
                {formatCurrency(metrics.targetPrice, profile.currency)}
              </span>
              <span className="text-[11px] text-cyan-500/70 font-light mt-2 block uppercase tracking-wider">Estimated</span>
            </div>
          </div>

          {/* Fair Value Estimate */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Fair Value Est.</span>
            <div className="mt-auto">
              <span className="text-sm sm:text-base font-bold text-zinc-300 tracking-tight leading-snug line-clamp-3" title={report.fairValueEstimate || 'N/A'}>
                {report.fairValueEstimate || 'N/A'}
              </span>
            </div>
          </div>

          {/* Expected Upside */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[11px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Expected Upside</span>
            <div className="mt-auto">
              <span className={`text-2xl sm:text-3xl lg:text-[32px] font-black tracking-tight leading-none flex items-center gap-1.5 ${((metrics.targetPrice || 0) > (metrics.currentPrice || 0)) ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.targetPrice && metrics.currentPrice 
                  ? formatPercentage((metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice) 
                  : 'N/A'}
              </span>
              <span className="text-[11px] text-zinc-500 font-light mt-2 block uppercase tracking-wider">Implied Margin</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. FULL-WIDTH STICKY TAB NAVIGATION (Seamlessly pinned under Header at top-[72px]) */}
      <div className="sticky top-[72px] z-30 w-full bg-[#060608]/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-sm select-none">
        <div className="site-container">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-2 sm:py-2.5">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                    active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENTS SECTION */}
      <div className="site-container pt-8 pb-16 sm:pb-20 min-w-0 relative z-10 flex flex-col flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full min-w-0"
          >
            
            {/* -------------------------------------------------------- */}
            {/* SUMMARY TAB                                              */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'summary' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                
                {/* Title & Desc */}
                <div className="section-head">
                  <h2 className="section-title">Executive Summary</h2>
                  <p className="section-desc">AI investment thesis, economic moat factors, and historical business multiples.</p>
                </div>

                {/* Thesis & Business Overview Card Split */}
                <div className="grid grid-cols-12 gap-5 sm:gap-6">
                  <div className="col-span-12 lg:col-span-8 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      Investment Thesis
                    </h3>
                    <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light max-w-[75ch] space-y-3.5 [&_p]:leading-relaxed [&_p]:max-w-[75ch] [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_strong]:text-white [&_strong]:font-semibold">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.investmentThesis}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-4 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                      <BookOpen className="h-4 w-4 text-purple-400" />
                      Business Overview
                    </h3>
                    <p className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light [&_strong]:text-white select-text">
                      {report.companyOverview || profile.description}
                    </p>
                  </div>
                </div>

                {/* Moat & Growth Drivers Split */}
                <div className="grid grid-cols-12 gap-5 sm:gap-6">
                  <div className="col-span-12 lg:col-span-7 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                      <Anchor className="h-4 w-4 text-amber-500" />
                      Competitive Advantage (Moat)
                    </h3>
                    <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light max-w-[75ch] space-y-3 [&_p]:mb-2.5 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-5">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.moatAnalysis || report.competitiveLandscape}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-5 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                      <Lightbulb className="h-4 w-4 text-emerald-400 animate-pulse" />
                      Key Growth Drivers
                    </h3>
                    <ul className="flex flex-col gap-3">
                      {report.growthCatalysts.map((cat, idx) => (
                        <li key={idx} className="flex gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60 shadow-inner">
                          <span className="text-emerald-400 font-black text-sm shrink-0">{idx + 1}.</span>
                          <span className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed">{cat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Financial Strength Split */}
                <div className="grid grid-cols-12 gap-5 sm:gap-6">
                  <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800/80 pb-3">
                      Revenue & Debt Analysis
                    </h3>
                    <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light [&_p]:mb-3 [&_strong]:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report.financialAnalysis.revenueAnalysis + '\n\n' + report.financialAnalysis.debtAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
                    <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800/80 pb-3">
                      Profitability Analysis
                    </h3>
                    <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light [&_p]:mb-3 [&_strong]:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {report.financialAnalysis.profitabilityAnalysis}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* Snapshot Multiples Grid */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Investment Snapshot
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
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
                      <div key={i} className="bg-[#0c0c0e]/40 border border-zinc-800 p-4 sm:p-5 rounded-xl flex flex-col gap-2 hover:bg-[#0c0c0e]/80 transition-colors duration-300 shadow-sm">
                        <span className="text-[10px] sm:text-[11px] text-zinc-500 uppercase tracking-widest font-black">{m.label}</span>
                        <span className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-none">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* FINANCIALS TAB                                           */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'financials' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                
                {/* Title & Desc */}
                <div className="section-head">
                  <h2 className="section-title">Financial Performance</h2>
                  <p className="section-desc">Historical bar trends, operating margins, and dynamic 1-year price chart.</p>
                </div>

                {/* Revenue & Margin Charts side by side */}
                <div className="grid grid-cols-12 gap-5 sm:gap-6 items-stretch">
                  <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6">
                    <RevenueChart
                      years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()}
                      revenues={financials.incomeStatements.map(i => i.revenue).reverse()}
                      ebitdas={financials.incomeStatements.map(i => i.ebitda).reverse()}
                      currency={profile.currency}
                    />
                  </div>
                  
                  <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6">
                    <MarginTrendChart
                      years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()}
                      grossMargins={financials.incomeStatements.map(i => i.grossProfitRatio*100).reverse()}
                      ebitdaMargins={financials.incomeStatements.map(i => (i.ebitda/(i.revenue||1))*100).reverse()}
                      netMargins={financials.incomeStatements.map(i => i.netIncomeRatio*100).reverse()}
                    />
                  </div>
                </div>

                {/* 1-Year Stock Price Chart */}
                <div className="w-full bg-[#0c0c0e]/40 border border-zinc-800 rounded-2xl p-5 sm:p-6">
                  {priceHistory.length > 0 ? (
                    <StockPriceChart prices={priceHistory} ticker={profile.ticker} currency={profile.currency} />
                  ) : (
                    <div className="w-full h-[180px] flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-xs">No historical price data loaded</div>
                  )}
                </div>

                {/* Financial Statements Table */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">Historical Statements Table</h3>
                  <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-[#0c0c0e]/40 backdrop-blur-md">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/40">
                          <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-500 font-black uppercase tracking-widest text-[10px]">Financial Item ({profile.currency})</th>
                          {financials.incomeStatements.map(i => (
                            <th key={i.date} className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-400 font-black uppercase tracking-widest text-[10px] text-right">{i.date.slice(0,4)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        <tr className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-400 font-medium text-xs">Revenue</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="px-4 py-3 sm:px-5 sm:py-3.5 text-right font-mono text-white text-xs">{formatCurrency(i.revenue, profile.currency)}</td>)}
                        </tr>
                        <tr className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-400 font-medium text-xs">Operating Income</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="px-4 py-3 sm:px-5 sm:py-3.5 text-right font-mono text-zinc-300 text-xs">{formatCurrency(i.operatingIncome, profile.currency)}</td>)}
                        </tr>
                        <tr className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-400 font-medium text-xs">Net Income</td>
                          {financials.incomeStatements.map(i => <td key={i.date} className="px-4 py-3 sm:px-5 sm:py-3.5 text-right font-mono text-cyan-400 font-bold text-xs">{formatCurrency(i.netIncome, profile.currency)}</td>)}
                        </tr>
                        <tr className="hover:bg-zinc-900/20 transition-colors">
                          <td className="px-4 py-3 sm:px-5 sm:py-3.5 text-zinc-400 font-medium text-xs">Free Cash Flow</td>
                          {financials.cashFlows.map(i => <td key={i.date} className="px-4 py-3 sm:px-5 sm:py-3.5 text-right font-mono text-emerald-400 font-bold text-xs">{formatCurrency(i.freeCashFlow, profile.currency)}</td>)}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* VALUATION TAB                                            */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'valuation' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                
                {/* Title & Desc */}
                <div className="section-head">
                  <h2 className="section-title">Valuation Modeling</h2>
                  <p className="section-desc">Simulate intrinsic fair value estimates using growth and WACC perpetuity multipliers.</p>
                </div>

                {/* Simulator Grid */}
                <DcfSimulator
                  initialFcf={financials.cashFlows[0]?.freeCashFlow || 0}
                  cash={financials.balanceSheets[0]?.cashAndEquivalents || 0}
                  debt={financials.balanceSheets[0]?.totalDebt || 0}
                  marketCap={profile.marketCap || 0}
                  currentPrice={metrics.currentPrice || 0}
                  currency={profile.currency}
                  market={profile.ticker.toUpperCase().endsWith('.NS') || profile.currency === 'INR' ? 'INDIA' : 'US'}
                />

                {/* Text card */}
                <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-5 sm:p-6 rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider border-b border-zinc-800/80 pb-3">
                    AI Valuation Model Analysis
                  </h3>
                  <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light max-w-[75ch] space-y-3 [&_p]:mb-2.5 [&_strong]:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.financialAnalysis.valuationAnalysis}</ReactMarkdown>
                  </div>
                </div>

              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* PEERS TAB                                                */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'peers' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                
                {/* Title & Desc */}
                <div className="section-head">
                  <h2 className="section-title">Competitor Analysis</h2>
                  <p className="section-desc">Compare comparative valuation multiples side-by-side with global peers.</p>
                </div>

                {/* Peer comparison panel */}
                <PeerComparison targetTicker={profile.ticker} targetName={profile.name} targetMetrics={metrics} />

              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* NEWS & SENTIMENT TAB                                     */}
            {/* -------------------------------------------------------- */}
            {activeTab === 'news' && (
              <div className="flex flex-col gap-8 sm:gap-10">
                
                {/* Title & Desc */}
                <div className="section-head">
                  <h2 className="section-title">Market News & Risks</h2>
                  <p className="section-desc">Scan critical corporate risk threats and read recent sentiment logs.</p>
                </div>

                {/* Risks grid */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-400" />
                    Critical Risk Vectors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {report.riskFactors.map((r, idx) => {
                      const sev = r.severity.toUpperCase();
                      let bc = 'bg-zinc-900 text-zinc-500 border-zinc-800';
                      if (sev === 'HIGH') bc = 'bg-red-500/10 text-red-400 border-red-500/20';
                      if (sev === 'MEDIUM') bc = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                      if (sev === 'LOW') bc = 'bg-green-500/10 text-green-400 border-green-500/20';
                      
                      return (
                        <div key={idx} className="bg-[#0c0c0e]/40 border border-zinc-800 p-5 sm:p-6 rounded-2xl flex flex-col gap-3 shadow-sm justify-between items-start">
                           <span className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded-lg border ${bc}`}>
                              {sev} RISK
                           </span>
                           <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-light mt-1">{r.risk}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sentiment scan details card */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">News Sentiment Weights</h3>
                  <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-5 sm:p-6 rounded-2xl shadow-sm">
                    <div className="text-sm sm:text-[15px] text-zinc-300 leading-relaxed font-light max-w-[75ch] space-y-3 [&_p]:mb-2.5 [&_strong]:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.newsSummary}</ReactMarkdown>
                    </div>
                  </div>
                </div>

                {/* News Articles Cards Grid */}
                <div className="flex flex-col gap-4 sm:gap-5">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Recent Headlines Scan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {report.newsItems.slice(0, 9).map((item, idx) => {
                      const sc = item.sentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                 item.sentiment === 'NEGATIVE' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-zinc-500 bg-zinc-900 border-zinc-850';
                      return (
                        <a
                          key={idx}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group bg-[#0c0c0e]/40 border border-zinc-800 hover:border-cyan-500/30 p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-4 transition-colors duration-300 min-w-0 shadow-sm"
                        >
                          <div className="flex flex-col gap-3 min-w-0">
                             <div className="flex justify-between items-center gap-2 min-w-0">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black truncate">{item.source}</span>
                                <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-lg shrink-0 border ${sc}`}>{item.sentiment}</span>
                             </div>
                             <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">{item.title}</h4>
                             <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed font-light">{item.snippet}</p>
                          </div>
                          <span className="text-[9px] text-zinc-500 font-mono font-medium shrink-0 pt-2 border-t border-zinc-800/60">{item.date}</span>
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

      {/* High-End Generation Modal Overlay */}
      {exporting && (
        <div className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="bg-[#0e1017] border border-cyan-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-cyan-950/60 flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-mono font-black text-cyan-400">
                  {exportPageIndex ? `${exportPageIndex}/7` : '...'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-black text-white tracking-tight">Generating Institutional Research Dossier</h3>
              <p className="text-xs text-cyan-400 font-mono tracking-wide">{exportStatus}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-zinc-700/50 mt-1">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${exportPageIndex ? (exportPageIndex / 7) * 100 : 8}%` }}
              />
            </div>

            <div className="flex justify-between items-center w-full text-[10px] text-zinc-500 uppercase tracking-widest font-mono pt-2 border-t border-zinc-800/80">
              <span>Vector Resolution: 2x</span>
              <span>Format: A4 Print Ready</span>
              <span>Confidential</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Page PDF Render Target (positioned at clean 0,0 coords behind overlay) */}
      {exporting && exportPageIndex && (
        <div
          id="pdf-export-mount"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '1000px',
            height: '1414px',
            zIndex: 99999,
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <PDFReportTemplate
            report={report}
            profile={profile}
            financials={financials}
            metrics={metrics}
            priceHistory={priceHistory}
            activePage={exportPageIndex}
          />
        </div>
      )}

    </div>
  );
}
