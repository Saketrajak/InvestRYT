"use client";

// ============================================================
// Investryt AI — Premium Report Dashboard & PDF Export
// ============================================================

import React, { useRef, useState } from 'react';
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
import {
  Download,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  Activity,
  Globe,
  Users,
  Compass,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ReportDetailsProps {
  report: ResearchReport;
  profile: CompanyProfile;
  financials: FinancialData;
  metrics: KeyMetrics;
  priceHistory: StockPriceEntry[];
}

export default function ReportDetails({
  report,
  profile,
  financials,
  metrics,
  priceHistory,
}: ReportDetailsProps) {
  const reportRef = useRef<HTMLDivElement>(null);
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
      if (abs >= 1e9) return `${sign}${sign === '-' ? '' : ''}${sym}${(abs / 1e9).toFixed(2)} B`;
      if (abs >= 1e6) return `${sign}${sym}${(abs / 1e6).toFixed(2)} M`;
      return `${sign}${sym}${abs.toLocaleString('en-US')}`;
    }
  };

  const formatPercentage = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    // If it's a decimal like 0.15, make it 15%
    const isDecimal = Math.abs(val) < 1.0 && val !== 0;
    const finalVal = isDecimal ? val * 100 : val;
    return `${finalVal.toFixed(1)}%`;
  };

  const formatNumber = (val: number | null | undefined) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toLocaleString();
  };

  // PDF Export logic
  const handlePdfExport = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09090b',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 Width
      const pageHeight = 295; // A4 Height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${report.ticker.toUpperCase()}_Equity_Research_Report.pdf`);
    } catch (err) {
      console.error('[PDF Export] Failed:', err);
    } finally {
      setExporting(false);
    }
  };

  // Gather values for margin trend charts
  const years = financials.incomeStatements.map((item) => item.date.slice(0, 4)).reverse();
  const revenues = financials.incomeStatements.map((item) => item.revenue).reverse();
  const ebitdas = financials.incomeStatements.map((item) => item.ebitda).reverse();

  const grossMargins = financials.incomeStatements.map((item) => item.grossProfitRatio * 100).reverse();
  const ebitdaMargins = financials.incomeStatements.map((item) => (item.ebitda / (item.revenue || 1)) * 100).reverse();
  const netMargins = financials.incomeStatements.map((item) => item.netIncomeRatio * 100).reverse();

  // Verdict design tokens
  const verdictConfig = {
    INVEST: { bg: 'bg-[#10b981]/10', border: 'border-[#10b981]/30', text: 'text-[#10b981]', dot: 'bg-[#10b981]' },
    PASS: { bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/30', text: 'text-[#ef4444]', dot: 'bg-[#ef4444]' },
    HOLD: { bg: 'bg-[#3b82f6]/10', border: 'border-[#3b82f6]/30', text: 'text-[#3b82f6]', dot: 'bg-[#3b82f6]' },
  };

  const currentVerdict = report.verdict.toUpperCase() as 'INVEST' | 'PASS' | 'HOLD';
  const vd = verdictConfig[currentVerdict] || verdictConfig.HOLD;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Top Header Actions (Not part of PDF ref) */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-500" />
          Equity Research Hub
        </h2>
        <button
          onClick={handlePdfExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-800/40 text-white rounded-lg font-medium transition-all text-sm border border-teal-500/20"
        >
          <Download className={`h-4 w-4 ${exporting ? 'animate-spin' : ''}`} />
          {exporting ? 'Exporting PDF...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Main Printable Dashboard Container */}
      <div
        ref={reportRef}
        id="report-container"
        className="w-full bg-[#09090b] text-[#f4f4f5] border border-[#232326] rounded-2xl overflow-hidden p-6 md:p-8 flex flex-col gap-8 shadow-2xl"
      >
        {/* SECTION 1: Report Title Header Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#232326] pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{profile.name}</h1>
              <span className="px-3 py-1 bg-zinc-800 text-zinc-300 border border-zinc-700 text-sm font-semibold rounded-md uppercase tracking-wider">
                {profile.ticker}:{profile.exchange}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Compass className="h-4 w-4 text-teal-500/80" /> {profile.sector}
              </span>
              <span>•</span>
              <span>{profile.industry}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${vd.bg} ${vd.border} ${vd.text}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${vd.dot}`} />
              <span className="font-bold tracking-wider text-sm">VERDICT: {report.verdict}</span>
            </div>

            <div className="bg-[#141416] border border-[#232326] px-4 py-1.5 rounded-xl text-center">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Confidence</div>
              <div className="text-lg font-bold text-amber-500">{report.confidenceScore}%</div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Premium Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Current Price', val: formatCurrency(metrics.currentPrice, profile.currency), icon: DollarSign, color: 'text-teal-400' },
            { label: 'Fair Value Est', val: report.fairValueEstimate.split(/[\s,]+/)[0] || 'N/A', icon: TrendingUp, color: 'text-amber-500' },
            { label: 'Market Cap', val: formatCurrency(profile.marketCap, profile.currency), icon: Briefcase, color: 'text-blue-400' },
            { label: 'P/E Ratio (TTM)', val: metrics.peRatio?.toFixed(1) || 'N/A', icon: Layers, color: 'text-indigo-400' },
            { label: 'ROE (TTM)', val: formatPercentage(metrics.roe), icon: Activity, color: 'text-purple-400' },
            { label: 'Dividend Yield', val: formatPercentage(metrics.dividendYield), icon: Globe, color: 'text-emerald-400' },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#141416] border border-[#232326] p-4 rounded-xl flex flex-col justify-between h-24">
              <div className="flex justify-between items-center text-xs text-zinc-500 font-bold uppercase tracking-wider">
                <span>{item.label}</span>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <div className="text-lg font-bold text-white mt-1 truncate">{item.val}</div>
            </div>
          ))}
        </div>

        {/* SECTION 3: Two Column Layout (Thesis + Overview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-[#232326] pb-8">
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              Investment Thesis
            </h2>
            <p className="text-zinc-300 leading-relaxed font-light text-base whitespace-pre-line">
              {report.investmentThesis}
            </p>
          </div>

          <div className="lg:col-span-4 bg-[#141416] border border-[#232326] p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-500" />
              Company Details
            </h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between border-b border-[#232326] pb-2">
                <span className="text-zinc-500 font-medium">Headquarters</span>
                <span className="text-zinc-300 font-semibold">{profile.country || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#232326] pb-2">
                <span className="text-zinc-500 font-medium">Employees</span>
                <span className="text-zinc-300 font-semibold">{formatNumber(profile.employees)}</span>
              </div>
              <div className="flex justify-between border-b border-[#232326] pb-2">
                <span className="text-zinc-500 font-medium">Currency</span>
                <span className="text-zinc-300 font-semibold uppercase">{profile.currency}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-zinc-500 font-medium">Website</span>
                {profile.website ? (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-zinc-300 font-semibold">N/A</span>
                )}
              </div>
            </div>
            <div className="mt-2 text-xs text-zinc-500 italic leading-relaxed">
              {report.companyOverview.slice(0, 180)}...
            </div>
          </div>
        </div>

        {/* SECTION 4: Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-[#232326] pb-8">
          <RevenueChart years={years} revenues={revenues} ebitdas={ebitdas} currency={profile.currency} />
          {priceHistory.length > 0 ? (
            <StockPriceChart prices={priceHistory} ticker={profile.ticker} currency={profile.currency} />
          ) : (
            <div className="w-full h-80 bg-[#141416] border border-[#232326] rounded-xl flex items-center justify-center text-zinc-500">
              Stock Price History Unavailable
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-[#232326] pb-8">
          <RadarChart metrics={metrics as any} verdict={report.verdict} />
          <MarginTrendChart years={years} grossMargins={grossMargins} ebitdaMargins={ebitdaMargins} netMargins={netMargins} />
        </div>

        {/* SECTION 5: Detailed Financial Analysis */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white border-b border-[#232326] pb-3">Institutional Financial Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Revenue & Growth Engine', content: report.financialAnalysis.revenueAnalysis },
              { title: 'Profitability & Margin Architecture', content: report.financialAnalysis.profitabilityAnalysis },
              { title: 'Valuation & Multiples Assessment', content: report.financialAnalysis.valuationAnalysis },
              { title: 'Balance Sheet, Leverage & Credit', content: report.financialAnalysis.debtAnalysis },
            ].map((section, idx) => (
              <div key={idx} className="bg-[#141416]/50 border border-[#232326] p-5 rounded-xl flex flex-col gap-2">
                <h3 className="text-md font-bold text-teal-400">{section.title}</h3>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-light">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: Moat, Competition & Peer Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-b border-[#232326] py-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-teal-400" />
              Economic Moat & Competitiveness
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-light">
              {report.moatAnalysis}
            </p>
            <div className="bg-[#141416] p-4 rounded-xl border border-[#232326] text-sm text-zinc-300">
              <strong className="text-white">Competitive Landscape Summary:</strong>
              <div className="mt-2 text-xs text-zinc-400 leading-relaxed font-light">
                {report.competitiveLandscape}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Growth Catalysts
            </h2>
            <div className="flex flex-col gap-3">
              {report.growthCatalysts.map((catalyst, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-[#141416]/80 p-3 rounded-lg border border-[#232326]">
                  <span className="h-5 w-5 bg-teal-500/10 text-teal-400 text-xs font-bold rounded-full flex items-center justify-center shrink-0 border border-teal-500/20 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-zinc-300 text-sm font-medium leading-normal">{catalyst}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 7: Risks Rating Panel */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Key Risk Factors & Severities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.riskFactors.map((r, idx) => {
              const badgeColors = {
                HIGH: 'bg-red-500/10 text-red-400 border-red-500/20',
                MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                LOW: 'bg-green-500/10 text-green-400 border-green-500/20',
              };
              const bc = badgeColors[r.severity.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW'] || badgeColors.MEDIUM;

              return (
                <div key={idx} className="bg-[#141416] border border-[#232326] p-4 rounded-xl flex flex-col justify-between gap-3">
                  <p className="text-zinc-300 text-sm leading-relaxed font-light">{r.risk}</p>
                  <span className={`self-start px-2 py-0.5 text-xs font-bold uppercase rounded-md border ${bc}`}>
                    {r.severity} Severity
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 8: News Sentiment Analysis */}
        <div className="flex flex-col gap-6 border-t border-[#232326] pt-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Market Sentiment & News Recap</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed">{report.newsSummary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.newsItems.slice(0, 4).map((item, idx) => {
              const sentimentConfig = {
                POSITIVE: 'bg-green-500/10 text-green-400 border-green-500/20',
                NEGATIVE: 'bg-red-500/10 text-red-400 border-red-500/20',
                NEUTRAL: 'bg-zinc-800 text-zinc-400 border-zinc-700',
              };
              const sc = sentimentConfig[item.sentiment.toUpperCase() as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'] || sentimentConfig.NEUTRAL;

              return (
                <div key={idx} className="bg-[#141416] border border-[#232326] p-4 rounded-xl flex flex-col justify-between gap-3 hover:border-zinc-700 transition-all">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border shrink-0 ${sc}`}>
                        {item.sentiment}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-1">{item.snippet}</p>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{item.source} • {item.date}</span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-teal-400 hover:underline flex items-center gap-0.5 font-semibold">
                        Link <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 9: Interactive Financial Statement Data Tables */}
        <div className="flex flex-col gap-4 border-t border-[#232326] pt-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            Historical Financial Statements Data Table
          </h2>
          <div className="w-full overflow-x-auto rounded-xl border border-[#232326]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#141416] border-b border-[#232326]">
                  <th className="p-3 text-zinc-400 font-bold uppercase tracking-wider min-w-[150px]">Metric ({profile.currency})</th>
                  {financials.incomeStatements.map((item) => (
                    <th key={item.date} className="p-3 text-zinc-300 font-bold uppercase tracking-wider text-right">
                      {item.date.slice(0, 4)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232326]">
                {/* Income Statement */}
                <tr className="bg-[#141416]/20 font-bold"><td className="p-3 text-teal-400" colSpan={financials.incomeStatements.length + 1}>INCOME STATEMENT</td></tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Revenue</td>
                  {financials.incomeStatements.map((item) => (
                    <td key={item.date} className="p-3 text-right text-white font-semibold">{formatCurrency(item.revenue, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Gross Profit</td>
                  {financials.incomeStatements.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300">{formatCurrency(item.grossProfit, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">EBITDA</td>
                  {financials.incomeStatements.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300 font-semibold">{formatCurrency(item.ebitda, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Operating Income</td>
                  {financials.incomeStatements.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300">{formatCurrency(item.operatingIncome, profile.currency)}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#232326]">
                  <td className="p-3 text-zinc-400 font-medium">Net Income</td>
                  {financials.incomeStatements.map((item) => (
                    <td key={item.date} className="p-3 text-right text-teal-400 font-bold">{formatCurrency(item.netIncome, profile.currency)}</td>
                  ))}
                </tr>

                {/* Balance Sheet */}
                <tr className="bg-[#141416]/20 font-bold"><td className="p-3 text-amber-500" colSpan={financials.incomeStatements.length + 1}>BALANCE SHEET</td></tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Total Assets</td>
                  {financials.balanceSheets.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300">{formatCurrency(item.totalAssets, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Total Liabilities</td>
                  {financials.balanceSheets.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300">{formatCurrency(item.totalLiabilities, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Stockholders Equity</td>
                  {financials.balanceSheets.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300 font-semibold">{formatCurrency(item.totalEquity, profile.currency)}</td>
                  ))}
                </tr>
                <tr className="border-b border-[#232326]">
                  <td className="p-3 text-zinc-400 font-medium">Total Debt</td>
                  {financials.balanceSheets.map((item) => (
                    <td key={item.date} className="p-3 text-right text-red-400">{formatCurrency(item.totalDebt, profile.currency)}</td>
                  ))}
                </tr>

                {/* Cash Flow */}
                <tr className="bg-[#141416]/20 font-bold"><td className="p-3 text-blue-400" colSpan={financials.incomeStatements.length + 1}>CASH FLOW STATEMENT</td></tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Operating Cash Flow</td>
                  {financials.cashFlows.map((item) => (
                    <td key={item.date} className="p-3 text-right text-zinc-300">{formatCurrency(item.operatingCashFlow, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Capital Expenditure</td>
                  {financials.cashFlows.map((item) => (
                    <td key={item.date} className="p-3 text-right text-red-400/80">-{formatCurrency(item.capitalExpenditure, profile.currency)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-zinc-400 font-medium">Free Cash Flow</td>
                  {financials.cashFlows.map((item) => (
                    <td key={item.date} className="p-3 text-right text-teal-400 font-bold">{formatCurrency(item.freeCashFlow, profile.currency)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 10: Disclaimer & Sensitivity Notes Footer */}
        <div className="border-t border-[#232326] pt-6 flex flex-col md:flex-row justify-between text-[10px] text-zinc-500 gap-4 leading-relaxed font-light">
          <div className="md:max-w-xl">
            <strong className="text-zinc-400">Institutional Disclaimer:</strong> This equity research analysis is compiled automatically by Investryt AI based on LLM-synthesized data and financial wrappers. It does not constitute formal, licensed financial advice. Past performance is not indicative of future market returns.
          </div>
          <div className="md:max-w-md md:text-right">
            <strong className="text-zinc-400">Sensitivity Note:</strong> {report.sensitivityNotes}
          </div>
        </div>
      </div>
    </div>
  );
}
