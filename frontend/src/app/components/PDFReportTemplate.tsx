import React from 'react';
import type { ResearchReport, CompanyProfile, FinancialData, KeyMetrics, StockPriceEntry } from '../../types/index.js';
import { RevenueChart, MarginTrendChart } from './charts';

interface PDFReportTemplateProps {
  report: ResearchReport;
  profile: CompanyProfile;
  financials: FinancialData;
  metrics: KeyMetrics;
  priceHistory: StockPriceEntry[];
}

export default function PDFReportTemplate({
  report,
  profile,
  financials,
  metrics,
  priceHistory
}: PDFReportTemplateProps) {
  
  // Formatters
  const formatCurrency = (val: number | null | undefined, currency: string = 'USD') => {
    if (val === null || val === undefined) return 'N/A';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    const sym = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency + ' ';
    if (abs >= 1e9) return `${sign}${sym}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${sym}${(abs / 1e6).toFixed(2)}M`;
    return `${sign}${sym}${abs.toLocaleString('en-US')}`;
  };

  const formatPercentage = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    const finalVal = Math.abs(val) < 1.0 && val !== 0 ? val * 100 : val;
    return `${finalVal.toFixed(1)}%`;
  };

  // Determine Recommendation colors
  let recColor = 'text-blue-400 border-blue-400 bg-blue-500/10';
  const verdictStr = report.verdict?.toUpperCase() || 'HOLD';
  if (verdictStr === 'INVEST' || verdictStr === 'STRONG BUY') recColor = 'text-emerald-400 border-emerald-400 bg-emerald-500/10';
  if (verdictStr === 'AVOID' || verdictStr === 'SELL' || verdictStr === 'PASS') recColor = 'text-red-400 border-red-400 bg-red-500/10';

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Extracted Data
  const years = financials?.incomeStatements?.map(i => i.date.slice(0,4)).reverse() || [];
  const revenues = financials?.incomeStatements?.map(i => i.revenue).reverse() || [];
  const ebitdas = financials?.incomeStatements?.map(i => i.ebitda).reverse() || [];

  // Reusable Page Wrapper
  const Page = ({ id, children, pageNum }: { id: string, children: React.ReactNode, pageNum?: number }) => (
    <div id={id} className="w-[1000px] h-[1414px] bg-[#09090b] text-zinc-300 flex flex-col relative overflow-hidden font-sans border border-transparent box-border">
      {/* Premium Gradient Backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/10 blur-[120px] pointer-events-none" />
      
      {/* Content */}
      <div className="flex-1 flex flex-col p-16 z-10">
        {children}
      </div>

      {/* Standard Footer for every page except Cover */}
      {pageNum && (
        <div className="absolute bottom-0 left-0 right-0 h-20 px-16 flex justify-between items-center border-t border-[rgba(255,255,255,.05)] bg-[#09090b]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-extrabold text-lg tracking-tighter">I/AI</span>
            <span className="text-zinc-500 text-sm font-medium tracking-wide">| {profile?.name} ({profile?.ticker})</span>
          </div>
          <div className="text-zinc-500 text-sm font-bold tracking-widest">{dateStr} • PAGE {pageNum}</div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 bg-zinc-950 p-8" id="pdf-export-container">
      
      {/* PAGE 1: COVER */}
      <Page id="pdf-page-1">
        <div className="flex flex-col h-full justify-between pb-8">
          
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                <span className="text-3xl font-black text-white tracking-tighter">I/AI</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">Investryt AI</span>
                <span className="text-sm font-bold text-cyan-400 uppercase tracking-[0.3em]">Institutional Research</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="px-4 py-2 rounded-full bg-[rgba(255,255,255,.05)] border border-[rgba(255,255,255,.1)] text-zinc-300 text-xs font-bold uppercase tracking-widest">
                Generated {dateStr}
              </span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Confidential • For Executive Use Only</span>
            </div>
          </div>

          {/* Title Area */}
          <div className="flex flex-col gap-6 mt-32">
            <h1 className="text-8xl font-black text-white tracking-tighter leading-[0.9]">
              {profile?.name}
            </h1>
            <div className="flex items-center gap-6 mt-4">
              <span className="text-4xl font-bold text-zinc-400 bg-[rgba(255,255,255,.05)] px-6 py-2 rounded-2xl border border-[rgba(255,255,255,.1)]">
                {profile?.exchange}:{profile?.ticker}
              </span>
              <span className="text-2xl font-medium text-zinc-500 uppercase tracking-widest">
                {profile?.sector} • {profile?.industry}
              </span>
            </div>
          </div>

          {/* Recommendation Pill */}
          <div className="flex flex-col items-start gap-4 mt-24">
            <span className="text-sm text-zinc-500 uppercase tracking-[0.2em] font-bold">AI Investment Recommendation</span>
            <div className={`px-10 py-5 rounded-3xl border-2 backdrop-blur-xl flex items-center gap-6 ${recColor}`}>
              <span className="text-4xl font-black uppercase tracking-widest">{verdictStr}</span>
              <div className="w-px h-12 bg-current opacity-30" />
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest opacity-80 font-bold">Confidence Score</span>
                <span className="text-2xl font-black">{report?.confidenceScore}/100</span>
              </div>
            </div>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-3 gap-8 mt-auto pt-16 border-t border-[rgba(255,255,255,.1)]">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Market Capitalization</span>
              <span className="text-2xl font-bold text-white">{formatCurrency(profile?.marketCap, profile?.currency)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Target Price</span>
              <span className="text-2xl font-bold text-cyan-400">{formatCurrency(metrics?.targetPrice, profile?.currency)}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Powered By</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-300">Gemini 2.5 Pro</span>
                <span className="text-zinc-600">+</span>
                <span className="text-sm font-bold text-zinc-300">Financial APIs</span>
              </div>
            </div>
          </div>

        </div>
      </Page>

      {/* PAGE 2: EXECUTIVE SUMMARY */}
      <Page id="pdf-page-2" pageNum={2}>
        <div className="flex flex-col gap-10">
          <h2 className="text-4xl font-black text-white tracking-tight border-b border-[rgba(255,255,255,.1)] pb-6">Executive Summary</h2>
          
          <div className="grid grid-cols-2 gap-10">
            {/* Left Col: Overview */}
            <div className="flex flex-col gap-6">
              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8">
                <h3 className="text-sm text-cyan-400 uppercase tracking-widest font-bold mb-4">Investment Thesis</h3>
                <p className="text-lg text-zinc-300 leading-relaxed font-light">{report?.investmentThesis}</p>
              </div>
              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8">
                <h3 className="text-sm text-purple-400 uppercase tracking-widest font-bold mb-4">Business Overview</h3>
                <p className="text-base text-zinc-400 leading-relaxed font-light">{profile?.description?.substring(0, 800) || 'N/A'}...</p>
              </div>
            </div>
            
            {/* Right Col: Valuation Matrix */}
            <div className="flex flex-col gap-6">
              <div className="bg-[rgba(18,18,20,.8)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                <h3 className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-8">Valuation Matrix</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,.05)]">
                    <span className="text-lg font-medium text-zinc-400">Current Price</span>
                    <span className="text-2xl font-black text-white">{formatCurrency(metrics?.currentPrice, profile?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,.05)]">
                    <span className="text-lg font-medium text-zinc-400">Target Price</span>
                    <span className="text-2xl font-black text-cyan-400">{formatCurrency(metrics?.targetPrice, profile?.currency)}</span>
                  </div>
                  <div className="flex justify-between items-start pb-4 border-b border-[rgba(255,255,255,.05)]">
                    <span className="text-lg font-medium text-zinc-400 pt-1">Fair Value Estimate</span>
                    <span className="text-lg font-bold text-zinc-200 text-right max-w-[200px] leading-snug">{report?.fairValueEstimate || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-zinc-400">Expected Upside</span>
                    <span className={`text-2xl font-black ${((metrics?.targetPrice || 0) > (metrics?.currentPrice || 0)) ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metrics?.targetPrice && metrics?.currentPrice 
                        ? formatPercentage((metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice) 
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8">
                <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-4">Key Takeaways</h3>
                <ul className="flex flex-col gap-3">
                  {report?.keyTakeaways?.map((takeaway, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-300 font-light">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Page>

      {/* PAGE 3: FINANCIAL ANALYSIS */}
      <Page id="pdf-page-3" pageNum={3}>
        <div className="flex flex-col gap-10 h-full">
          <h2 className="text-4xl font-black text-white tracking-tight border-b border-[rgba(255,255,255,.1)] pb-6">Financial Performance</h2>
          
          <div className="grid grid-cols-2 gap-8 h-[400px]">
            <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-6 flex flex-col">
              <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-4">Revenue & EBITDA Trend</h3>
              <div className="flex-1 min-h-0 w-full relative">
                <div className="absolute inset-0">
                  <RevenueChart years={years} revenues={revenues} ebitdas={ebitdas} currency={profile?.currency} />
                </div>
              </div>
            </div>
            <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-6 flex flex-col">
              <h3 className="text-sm text-zinc-400 uppercase tracking-widest font-bold mb-4">Margin Progression</h3>
              <div className="flex-1 min-h-0 w-full relative">
                 <div className="absolute inset-0">
                   <MarginTrendChart 
                      years={years} 
                      grossMargins={financials?.incomeStatements?.map((item) => item.grossProfitRatio * 100).reverse() || []}
                      ebitdaMargins={financials?.incomeStatements?.map((item) => (item.ebitda / (item.revenue || 1)) * 100).reverse() || []} 
                      netMargins={financials?.incomeStatements?.map((item) => item.netIncomeRatio * 100).reverse() || []} 
                   />
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-sm text-cyan-400 uppercase tracking-widest font-bold">Historical Financial Summary</h3>
            <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,.05)] bg-[rgba(255,255,255,.01)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[rgba(255,255,255,.03)] border-b border-[rgba(255,255,255,.05)]">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px]">Fiscal Year</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px] text-right">Revenue</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px] text-right">Gross Margin</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px] text-right">Operating Inc</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px] text-right">Net Income</th>
                    <th className="px-6 py-4 font-bold uppercase tracking-widest text-zinc-500 text-[10px] text-right">EPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,.03)]">
                  {financials?.incomeStatements?.slice(0,5).map((stmt, i) => (
                    <tr key={i} className="hover:bg-[rgba(255,255,255,.02)] transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{stmt.date.slice(0,4)}</td>
                      <td className="px-6 py-4 font-mono text-right text-zinc-300">{formatCurrency(stmt.revenue, profile?.currency)}</td>
                      <td className="px-6 py-4 font-mono text-right text-zinc-300">{formatPercentage(stmt.grossProfitRatio)}</td>
                      <td className="px-6 py-4 font-mono text-right text-zinc-300">{formatCurrency(stmt.operatingIncome, profile?.currency)}</td>
                      <td className="px-6 py-4 font-mono text-right text-zinc-300">{formatCurrency(stmt.netIncome, profile?.currency)}</td>
                      <td className="px-6 py-4 font-mono text-right text-cyan-400 font-bold">{stmt.eps?.toFixed(2) || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Page>

      {/* PAGE 4: BUSINESS QUALITY & RISKS */}
      <Page id="pdf-page-4" pageNum={4}>
        <div className="flex flex-col gap-10">
          <h2 className="text-4xl font-black text-white tracking-tight border-b border-[rgba(255,255,255,.1)] pb-6">Business Quality & Risk Profile</h2>
          
          <div className="grid grid-cols-2 gap-10">
            {/* Moat */}
            <div className="flex flex-col gap-6">
              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8">
                <h3 className="text-sm text-cyan-400 uppercase tracking-widest font-bold mb-4">Economic Moat</h3>
                <p className="text-base text-zinc-300 leading-relaxed font-light">{report?.moatAnalysis}</p>
              </div>
              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8">
                <h3 className="text-sm text-purple-400 uppercase tracking-widest font-bold mb-4">Catalysts & Tailwinds</h3>
                <ul className="flex flex-col gap-3">
                  {report?.growthCatalysts?.map((cat, i) => (
                    <li key={i} className="flex gap-3 text-base text-zinc-300 font-light">
                      <span className="text-cyan-400 mt-1">•</span>
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Risks */}
            <div className="flex flex-col gap-6">
              <div className="bg-[rgba(239,68,68,.05)] border border-[rgba(239,68,68,.1)] rounded-3xl p-8">
                <h3 className="text-sm text-red-400 uppercase tracking-widest font-bold mb-4">Key Risk Factors</h3>
                <ul className="flex flex-col gap-4">
                  {report?.riskFactors?.map((riskData, i) => (
                    <li key={i} className="flex gap-3 text-base text-zinc-300 font-light bg-[rgba(255,255,255,.03)] p-4 rounded-2xl">
                      <span className="text-red-400 mt-0.5">
                        {riskData.severity === 'HIGH' ? '🚨' : riskData.severity === 'MEDIUM' ? '⚠️' : 'ℹ️'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">{riskData.severity} RISK</span>
                        <span>{riskData.risk}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-[rgba(255,255,255,.02)] border border-[rgba(255,255,255,.05)] rounded-3xl p-8 mt-auto">
                <h3 className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-4">Disclaimer</h3>
                <p className="text-[10px] text-zinc-600 leading-relaxed font-mono uppercase">
                  This report is generated by Investryt AI using autonomous artificial intelligence models. It does not constitute professional financial advice. All data and analysis are for informational purposes only. Investors should conduct their own due diligence before making investment decisions. Past performance is not indicative of future results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Page>

    </div>
  );
}
