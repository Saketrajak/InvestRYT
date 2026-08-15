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
          backgroundColor: '#060608',
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
    <div className="w-full min-h-screen bg-[#060608] text-zinc-300 flex flex-col relative overflow-y-auto overflow-x-hidden pb-[80px]">
      
      {/* Centered Premium Page Wrapper */}
      <div className="max-w-[1500px] w-full mx-auto px-[40px] pt-[32px] pb-[80px] flex flex-col gap-[40px] min-w-0 relative z-10">
        
        {/* 1. COMPANY HEADER */}
        <div className="flex flex-col xl:flex-row justify-between items-start gap-[24px] relative min-w-0">
          <div className="flex flex-col gap-[12px] min-w-0 flex-1">
            <div className="flex items-center gap-[16px] flex-wrap">
              <span className="px-[12px] py-[4px] rounded-lg bg-zinc-900 border border-zinc-800 text-[12px] font-bold text-zinc-400 uppercase tracking-widest backdrop-blur-md">
                {profile.exchange}:{profile.ticker}
              </span>
              <span className="h-[4px] w-[4px] rounded-full bg-zinc-800" />
              <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">{profile.sector}</span>
              <span className="h-[4px] w-[4px] rounded-full bg-zinc-800" />
              <span className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">{profile.industry}</span>
            </div>
            
            <h1 className="text-[56px] font-black text-white tracking-tight leading-[1.1] select-all">
              {profile.name}
            </h1>
            
            <div className="flex flex-wrap gap-[24px] text-[14px] text-zinc-400 font-medium mt-[4px]">
              <span className="flex items-center gap-[8px]"><MapPin className="h-[16px] w-[16px] text-zinc-650" /> {profile.country}</span>
              <span className="flex items-center gap-[8px]"><Briefcase className="h-[16px] w-[16px] text-zinc-650" /> Market Cap: {formatCurrency(profile.marketCap, profile.currency)}</span>
              <span className="flex items-center gap-[8px]"><Users className="h-[16px] w-[16px] text-zinc-650" /> Employees: {formatNumber(profile.employees)}</span>
            </div>
          </div>

          {/* Download PDF button (Aligned to header row) */}
          <button
            onClick={handlePdfExport}
            disabled={exporting}
            className="group flex items-center justify-center gap-[8px] h-[44px] px-[20px] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-[12px] text-[12px] font-bold uppercase tracking-widest transition-all duration-300 shadow-md shadow-purple-500/10 cursor-pointer shrink-0 self-stretch xl:self-auto"
          >
            {exporting ? (
              <Activity className="h-[14px] w-[14px] animate-spin text-cyan-450" />
            ) : (
              <Download className="h-[14px] w-[14px] text-cyan-400 group-hover:text-white transition-colors" />
            )}
            <span>{exporting ? 'Compiling PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>

        {/* 2. HERO METRICS GRID (Identical heights, padding, border-radius) */}
        <div className="grid grid-cols-12 gap-[24px] items-stretch w-full">
          
          {/* Verdict Card */}
          <div className={`col-span-12 lg:col-span-4 bg-[#0c0c0e]/60 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col justify-between min-h-[160px] relative backdrop-blur-2xl ${vd.glow}`}>
            <div className="flex items-center gap-[8px]">
              <span className={`px-[10px] py-[3px] rounded-lg border text-[11px] font-bold uppercase tracking-widest ${vd.tag}`}>
                {report.verdict}
              </span>
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Decision Verdict</span>
            </div>
            <div className="mt-[16px]">
              <h3 className="text-[20px] font-bold text-white leading-tight">AI Investment Verdict</h3>
              <p className="text-[14px] text-zinc-400 font-light mt-[8px] leading-relaxed">
                Calculated with <strong className="text-white font-semibold">{report.confidenceScore}%</strong> confidence based on multi-agent financial modeling.
              </p>
            </div>
          </div>

          {/* Current Price */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[12px] text-zinc-500 uppercase tracking-widest font-bold">Current Price</span>
            <div className="mt-auto">
              <span className="text-[38px] font-black text-white tracking-tight leading-none">
                {formatCurrency(metrics.currentPrice, profile.currency)}
              </span>
              <span className="text-[12px] text-zinc-500 font-light mt-[8px] block uppercase tracking-wider">{profile.currency}</span>
            </div>
          </div>

          {/* Target Price */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[12px] text-zinc-500 uppercase tracking-widest font-bold">Target Price</span>
            <div className="mt-auto">
              <span className="text-[38px] font-black text-cyan-400 tracking-tight leading-none">
                {formatCurrency(metrics.targetPrice, profile.currency)}
              </span>
              <span className="text-[12px] text-cyan-500/70 font-light mt-[8px] block uppercase tracking-wider">Estimated</span>
            </div>
          </div>

          {/* Fair Value Estimate */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[12px] text-zinc-500 uppercase tracking-widest font-bold">Fair Value Est.</span>
            <div className="mt-auto">
              <span className="text-[16px] lg:text-[18px] font-bold text-zinc-300 tracking-tight leading-snug line-clamp-3" title={report.fairValueEstimate || 'N/A'}>
                {report.fairValueEstimate || 'N/A'}
              </span>
            </div>
          </div>

          {/* Expected Upside */}
          <div className="col-span-6 md:col-span-3 lg:col-span-2 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col justify-between min-h-[160px] shadow-sm hover:border-zinc-700 transition-colors duration-300">
            <span className="text-[12px] text-zinc-500 uppercase tracking-widest font-bold">Expected Upside</span>
            <div className="mt-auto">
              <span className={`text-[38px] font-black tracking-tight leading-none flex items-center gap-[8px] ${((metrics.targetPrice || 0) > (metrics.currentPrice || 0)) ? 'text-emerald-400' : 'text-red-400'}`}>
                {metrics.targetPrice && metrics.currentPrice 
                  ? formatPercentage((metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice) 
                  : 'N/A'}
              </span>
              <span className="text-[12px] text-zinc-550 font-light mt-[8px] block uppercase tracking-wider">Implied Margin</span>
            </div>
          </div>

        </div>

        {/* 3. TAB NAVIGATION */}
        <div className="sticky top-[80px] z-30 bg-[#060608]/90 backdrop-blur-xl border-b border-zinc-850 w-full select-none">
          <div className="flex gap-[32px] overflow-x-auto no-scrollbar py-[12px]">
            {navTabs.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-[8px] text-[12px] font-bold uppercase tracking-widest flex items-center gap-[8px] whitespace-nowrap transition-colors duration-300 cursor-pointer ${
                    active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`h-[16px] w-[16px] ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. TAB CONTENTS (48px spacing offset from tabs bar) */}
        <div className="w-full mt-[16px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full min-w-0"
            >
              
              {/* -------------------------------------------------------- */}
              {/* SUMMARY TAB                                              */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'summary' && (
                <div className="flex flex-col gap-[48px]">
                  
                  {/* Title & Desc */}
                  <div className="section-head">
                    <h2 className="section-title">Executive Summary</h2>
                    <p className="section-desc">AI investment thesis, economic moat factors, and historical business multiples.</p>
                  </div>

                  {/* Thesis & Business Overview Card Split */}
                  <div className="grid grid-cols-12 gap-[24px]">
                    <div className="col-span-12 lg:col-span-8 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px] border-b border-zinc-850 pb-[12px]">
                        <Sparkles className="h-[18px] w-[18px] text-cyan-400" />
                        Investment Thesis
                      </h3>
                      <div className="text-[15px] text-zinc-300 leading-[1.6] font-light max-w-[75ch] space-y-[16px] [&_p]:leading-[1.6] [&_p]:max-w-[75ch] [&_p]:mb-[12px] [&_ul]:list-disc [&_ul]:pl-[20px] [&_ol]:list-decimal [&_ol]:pl-[20px] [&_li]:mb-[8px] [&_strong]:text-white [&_strong]:font-semibold">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.investmentThesis}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px] border-b border-zinc-850 pb-[12px]">
                        <BookOpen className="h-[18px] w-[18px] text-purple-400" />
                        Business Overview
                      </h3>
                      <p className="text-[15px] text-zinc-300 leading-[1.6] font-light [&_strong]:text-white select-text">
                        {report.companyOverview || profile.description}
                      </p>
                    </div>
                  </div>

                  {/* Moat & Growth Drivers Split */}
                  <div className="grid grid-cols-12 gap-[24px]">
                    <div className="col-span-12 lg:col-span-7 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px] border-b border-zinc-850 pb-[12px]">
                        <Anchor className="h-[18px] w-[18px] text-amber-500" />
                        Competitive Advantage (Moat)
                      </h3>
                      <div className="text-[15px] text-zinc-300 leading-[1.6] font-light max-w-[75ch] space-y-[12px] [&_p]:mb-[10px] [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-[20px]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.moatAnalysis || report.competitiveLandscape}</ReactMarkdown>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-5 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px] border-b border-zinc-850 pb-[12px]">
                        <Lightbulb className="h-[18px] w-[18px] text-emerald-400 animate-pulse" />
                        Key Growth Drivers
                      </h3>
                      <ul className="flex flex-col gap-[12px]">
                        {report.growthCatalysts.map((cat, idx) => (
                          <li key={idx} className="flex gap-[12px] p-[16px] rounded-[12px] bg-zinc-900/30 border border-zinc-800/60 shadow-inner">
                            <span className="text-emerald-450 font-black text-[14px] shrink-0">{idx + 1}.</span>
                            <span className="text-zinc-300 text-[14px] font-light leading-relaxed">{cat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Financial Strength Split */}
                  <div className="grid grid-cols-12 gap-[24px]">
                    <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-[12px]">
                        Revenue & Debt Analysis
                      </h3>
                      <div className="text-[15px] text-zinc-300 leading-[1.6] font-light [&_p]:mb-[12px] [&_strong]:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {report.financialAnalysis.revenueAnalysis + '\n\n' + report.financialAnalysis.debtAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>

                    <div className="col-span-12 lg:col-span-6 bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[24px] flex flex-col gap-[16px] shadow-sm">
                      <h3 className="text-[20px] font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-[12px]">
                        Profitability Analysis
                      </h3>
                      <div className="text-[15px] text-zinc-300 leading-[1.6] font-light [&_p]:mb-[12px] [&_strong]:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {report.financialAnalysis.profitabilityAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* Snapshot Multiples Grid */}
                  <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px]">
                      <Scale className="h-[18px] w-[18px]" />
                      Investment Snapshot
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[24px]">
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
                        <div key={i} className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[8px] hover:bg-[#0c0c0e]/80 transition-colors duration-300 shadow-sm">
                          <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-black">{m.label}</span>
                          <span className="text-[28px] font-bold text-white tracking-tight leading-none">{m.val}</span>
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
                <div className="flex flex-col gap-[48px]">
                  
                  {/* Title & Desc */}
                  <div className="section-head">
                    <h2 className="section-title">Financial Performance</h2>
                    <p className="section-desc">Historical bar trends, operating margins, and dynamic 1-year price chart.</p>
                  </div>

                  {/* Revenue & Margin Charts side by side */}
                  <div className="grid grid-cols-12 gap-[24px] items-stretch">
                    <div className="col-span-12 lg:col-span-6">
                      <RevenueChart
                        years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()}
                        revenues={financials.incomeStatements.map(i => i.revenue).reverse()}
                        ebitdas={financials.incomeStatements.map(i => i.ebitda).reverse()}
                        currency={profile.currency}
                      />
                    </div>
                    
                    <div className="col-span-12 lg:col-span-6">
                      <MarginTrendChart
                        years={financials.incomeStatements.map(i => i.date.slice(0,4)).reverse()}
                        grossMargins={financials.incomeStatements.map(i => i.grossProfitRatio*100).reverse()}
                        ebitdaMargins={financials.incomeStatements.map(i => (i.ebitda/(i.revenue||1))*100).reverse()}
                        netMargins={financials.incomeStatements.map(i => i.netIncomeRatio*100).reverse()}
                      />
                    </div>
                  </div>

                  {/* 1-Year Stock Price Chart */}
                  <div className="w-full">
                    {priceHistory.length > 0 ? (
                      <StockPriceChart prices={priceHistory} ticker={profile.ticker} currency={profile.currency} />
                    ) : (
                      <div className="w-full h-[180px] bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] flex items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-[12px]">No historical price data loaded</div>
                    )}
                  </div>

                  {/* Financial Statements Table */}
                  <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">Historical Statements Table</h3>
                    <div className="overflow-x-auto rounded-[16px] border border-zinc-800 bg-[#0c0c0e]/40 backdrop-blur-md">
                      <table className="w-full text-left border-collapse text-[14px]">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-900/40">
                            <th className="p-[20px] text-zinc-500 font-black uppercase tracking-widest text-[10px]">Financial Item ({profile.currency})</th>
                            {financials.incomeStatements.map(i => (
                              <th key={i.date} className="p-[20px] text-zinc-400 font-black uppercase tracking-widest text-[10px] text-right">{i.date.slice(0,4)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850">
                          <tr className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-[20px] text-zinc-400 font-medium text-xs">Revenue</td>
                            {financials.incomeStatements.map(i => <td key={i.date} className="p-[20px] text-right font-mono text-white text-xs">{formatCurrency(i.revenue, profile.currency)}</td>)}
                          </tr>
                          <tr className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-[20px] text-zinc-400 font-medium text-xs">Operating Income</td>
                            {financials.incomeStatements.map(i => <td key={i.date} className="p-[20px] text-right font-mono text-zinc-300 text-xs">{formatCurrency(i.operatingIncome, profile.currency)}</td>)}
                          </tr>
                          <tr className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-[20px] text-zinc-400 font-medium text-xs">Net Income</td>
                            {financials.incomeStatements.map(i => <td key={i.date} className="p-[20px] text-right font-mono text-cyan-400 font-bold text-xs">{formatCurrency(i.netIncome, profile.currency)}</td>)}
                          </tr>
                          <tr className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-[20px] text-zinc-400 font-medium text-xs">Free Cash Flow</td>
                            {financials.cashFlows.map(i => <td key={i.date} className="p-[20px] text-right font-mono text-emerald-400 font-bold text-xs">{formatCurrency(i.freeCashFlow, profile.currency)}</td>)}
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
                <div className="flex flex-col gap-[48px]">
                  
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
                  <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[16px] shadow-sm">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider border-b border-zinc-850 pb-[12px]">
                      AI Valuation Model Analysis
                    </h3>
                    <div className="text-[15px] text-zinc-300 leading-[1.6] font-light max-w-[75ch] space-y-[12px] [&_p]:mb-[10px] [&_strong]:text-white">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.financialAnalysis.valuationAnalysis}</ReactMarkdown>
                    </div>
                  </div>

                </div>
              )}

              {/* -------------------------------------------------------- */}
              {/* PEERS TAB                                                */}
              {/* -------------------------------------------------------- */}
              {activeTab === 'peers' && (
                <div className="flex flex-col gap-[48px]">
                  
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
                <div className="flex flex-col gap-[48px]">
                  
                  {/* Title & Desc */}
                  <div className="section-head">
                    <h2 className="section-title">Market News & Risks</h2>
                    <p className="section-desc">Scan critical corporate risk threats and read recent sentiment logs.</p>
                  </div>

                  {/* Risks grid */}
                  <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px]">
                      <ShieldAlert className="h-[18px] w-[18px] text-red-400" />
                      Critical Risk Vectors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                      {report.riskFactors.map((r, idx) => {
                        const sev = r.severity.toUpperCase();
                        let bc = 'bg-zinc-900 text-zinc-500 border-zinc-800';
                        if (sev === 'HIGH') bc = 'bg-red-500/10 text-red-400 border-red-500/20';
                        if (sev === 'MEDIUM') bc = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                        if (sev === 'LOW') bc = 'bg-green-500/10 text-green-400 border-green-500/20';
                        
                        return (
                          <div key={idx} className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[16px] shadow-sm justify-between items-start">
                             <span className={`px-[12px] py-[4px] text-[9px] font-black tracking-widest uppercase rounded-lg border ${bc}`}>
                                {sev} RISK
                             </span>
                             <p className="text-zinc-300 text-[14px] leading-relaxed font-light mt-[4px]">{r.risk}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sentiment scan details card */}
                  <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider">News Sentiment Weights</h3>
                    <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] shadow-sm">
                      <div className="text-[15px] text-zinc-300 leading-[1.6] font-light max-w-[75ch] space-y-[12px] [&_p]:mb-[10px] [&_strong]:text-white">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.newsSummary}</ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {/* News Articles Cards Grid */}
                  <div className="flex flex-col gap-[20px]">
                    <h3 className="text-[20px] font-bold text-white uppercase tracking-wider flex items-center gap-[8px]">
                      Recent Headlines Scan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                      {report.newsItems.slice(0, 9).map((item, idx) => {
                        const sc = item.sentiment === 'POSITIVE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                                   item.sentiment === 'NEGATIVE' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-zinc-500 bg-zinc-900 border-zinc-850';
                        return (
                          <a
                            key={idx}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group bg-[#0c0c0e]/40 border border-zinc-800 hover:border-cyan-500/30 p-[24px] rounded-[16px] flex flex-col justify-between gap-[16px] transition-colors duration-300 min-w-0 shadow-sm"
                          >
                            <div className="flex flex-col gap-[12px] min-w-0">
                               <div className="flex justify-between items-center gap-[8px] min-w-0">
                                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black truncate">{item.source}</span>
                                  <span className={`px-[10px] py-[3px] text-[9px] font-bold uppercase rounded-lg shrink-0 border ${sc}`}>{item.sentiment}</span>
                               </div>
                               <h4 className="text-[14px] font-bold text-zinc-200 group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">{item.title}</h4>
                               <p className="text-zinc-500 text-[12px] line-clamp-2 leading-relaxed font-light">{item.snippet}</p>
                            </div>
                            <span className="text-[9px] text-zinc-650 font-mono font-medium shrink-0 pt-[8px] border-t border-zinc-850/60">{item.date}</span>
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
      </div>

      {/* Hidden PDF template — off-screen but full-size so html2canvas can capture it */}
      <div className="fixed -left-[9999px] top-0 opacity-0 pointer-events-none -z-50" aria-hidden="true">
        <PDFReportTemplate report={report} profile={profile} financials={financials} metrics={metrics} priceHistory={priceHistory} />
      </div>

    </div>
  );
}
