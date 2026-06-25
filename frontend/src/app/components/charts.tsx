"use client";

// ============================================================
// Investryt AI — Premium Chart Components
// ============================================================

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RevenueChartProps {
  years: string[];
  revenues: number[];
  ebitdas: number[];
  currency: string;
}

export function RevenueChart({ years, revenues, ebitdas, currency }: RevenueChartProps) {
  // Format numbers to short form (e.g. 1.2B, 340M)
  const formatShort = (val: number) => {
    const abs = Math.abs(val);
    if (abs >= 1e12) return (val / 1e12).toFixed(1) + 'T';
    if (abs >= 1e9) return (val / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val.toString();
  };

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#14b8a6', '#f59e0b'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: years,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatShort(val),
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    fill: { opacity: 0.95 },
    tooltip: {
      y: {
        formatter: (val) => `${formatShort(val)} ${currency}`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#f4f4f5',
        useSeriesColors: false,
      },
      markers: {
        strokeWidth: 0,
      },
    },
    grid: {
      borderColor: '#232326',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  };

  const series = [
    { name: 'Revenue', data: revenues },
    { name: 'EBITDA', data: ebitdas },
  ];

  return (
    <div className="w-full h-80 bg-[#141416] p-5 rounded-xl border border-[#232326]">
      <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Revenue & EBITDA Trend</h3>
      <div className="w-full h-64">
        <Chart options={options} series={series} type="bar" height="100%" />
      </div>
    </div>
  );
}

interface StockPriceChartProps {
  prices: { date: string; close: number }[];
  ticker: string;
  currency: string;
}

export function StockPriceChart({ prices, ticker, currency }: StockPriceChartProps) {
  const dates = prices.map((p) => p.date);
  const values = prices.map((p) => p.close);

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      sparkline: { enabled: false },
      background: 'transparent',
    },
    colors: ['#14b8a6'],
    stroke: {
      curve: 'smooth',
      width: 2.5,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95],
      },
    },
    xaxis: {
      categories: dates,
      type: 'datetime',
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
      tickAmount: 6,
    },
    yaxis: {
      labels: {
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#232326',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      x: { format: 'dd MMM yyyy' },
      y: {
        formatter: (val) => `${val.toFixed(2)} ${currency}`,
      },
    },
  };

  const series = [{ name: `${ticker} Price`, data: values }];

  return (
    <div className="w-full h-80 bg-[#141416] p-5 rounded-xl border border-[#232326]">
      <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">1-Year Stock Price Chart</h3>
      <div className="w-full h-64">
        <Chart options={options} series={series} type="area" height="100%" />
      </div>
    </div>
  );
}

interface RadarChartProps {
  metrics: {
    peRatio: number | null;
    roe: number | null;
    currentRatio: number | null;
    debtToEquity: number | null;
    dividendYield: number | null;
  };
  verdict: 'INVEST' | 'PASS' | 'HOLD';
}

export function RadarChart({ metrics, verdict }: RadarChartProps) {
  // Normalize ratings on 1 to 10 scale for the radar chart
  const roeScore = Math.min(Math.max((metrics.roe || 0) / 4, 1), 10);
  const peScore = metrics.peRatio ? Math.min(Math.max(50 / metrics.peRatio, 1), 10) : 5;
  const currentRatioScore = Math.min(Math.max((metrics.currentRatio || 0) * 4, 1), 10);
  const debtScore = metrics.debtToEquity !== null ? Math.min(Math.max(10 - metrics.debtToEquity * 5, 1), 10) : 5;
  const divScore = Math.min(Math.max((metrics.dividendYield || 0) * 2, 1), 10);
  const verdictScore = verdict === 'INVEST' ? 9.5 : verdict === 'HOLD' ? 7.0 : 4.0;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'radar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#f59e0b'],
    stroke: {
      show: true,
      width: 2,
      colors: ['#f59e0b'],
    },
    fill: {
      opacity: 0.25,
      colors: ['#f59e0b'],
    },
    markers: {
      size: 4,
      colors: ['#09090b'],
      strokeColors: '#f59e0b',
      strokeWidth: 2,
    },
    xaxis: {
      categories: [
        'Profitability (ROE)',
        'Valuation (P/E)',
        'Liquidity (Curr Ratio)',
        'Solvency (D/E)',
        'Yield (Dividend)',
        'Verdict Alignment',
      ],
      labels: {
        style: {
          colors: ['#a1a1aa', '#a1a1aa', '#a1a1aa', '#a1a1aa', '#a1a1aa', '#a1a1aa'],
          fontSize: '11px',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      show: false,
      min: 0,
      max: 10,
    },
    grid: {
      show: false,
    },
  };

  const series = [
    {
      name: 'Factor Score',
      data: [
        parseFloat(roeScore.toFixed(1)),
        parseFloat(peScore.toFixed(1)),
        parseFloat(currentRatioScore.toFixed(1)),
        parseFloat(debtScore.toFixed(1)),
        parseFloat(divScore.toFixed(1)),
        parseFloat(verdictScore.toFixed(1)),
      ],
    },
  ];

  return (
    <div className="w-full h-80 bg-[#141416] p-5 rounded-xl border border-[#232326] flex flex-col justify-between">
      <h3 className="text-sm font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Financial Radar Score</h3>
      <div className="w-full h-64 flex items-center justify-center">
        <Chart options={options} series={series} type="radar" height="100%" width="100%" />
      </div>
    </div>
  );
}

interface MarginChartProps {
  years: string[];
  grossMargins: number[];
  ebitdaMargins: number[];
  netMargins: number[];
}

export function MarginTrendChart({ years, grossMargins, ebitdaMargins, netMargins }: MarginChartProps) {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#14b8a6', '#f59e0b', '#3b82f6'],
    stroke: {
      curve: 'straight',
      width: 2.5,
    },
    xaxis: {
      categories: years,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val.toFixed(1)}%`,
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#232326',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#f4f4f5',
        useSeriesColors: false,
      },
    },
  };

  const series = [
    { name: 'Gross Margin', data: grossMargins },
    { name: 'EBITDA Margin', data: ebitdaMargins },
    { name: 'Net Profit Margin', data: netMargins },
  ];

  return (
    <div className="w-full h-80 bg-[#141416] p-5 rounded-xl border border-[#232326]">
      <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Margin Trend Analysis</h3>
      <div className="w-full h-64">
        <Chart options={options} series={series} type="line" height="100%" />
      </div>
    </div>
  );
}
