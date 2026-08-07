"use client";

// ============================================================
// Investryt AI — Premium Chart Components (Refined UI)
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
    colors: ['#06b6d4', '#eab308'], // Sleek cyan & gold
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
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
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatShort(val),
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    fill: { opacity: 0.9 },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `${formatShort(val)} ${currency}`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      fontSize: '11px',
      labels: {
        colors: '#a1a1aa',
      },
      markers: {
        strokeWidth: 0,
      },
    },
    grid: {
      borderColor: '#27272a/40',
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
    <div className="w-full h-[380px] bg-[#0c0c0e]/40 p-[32px] rounded-[16px] border border-zinc-800 flex flex-col justify-between shadow-md">
      <h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Revenue & EBITDA Trajectory</h3>
      <div className="w-full h-[260px] mt-[16px]">
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
    colors: ['#06b6d4'],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
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
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
      tickAmount: 5,
    },
    yaxis: {
      labels: {
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#27272a/40',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM yyyy' },
      y: {
        formatter: (val) => `${val.toFixed(2)} ${currency}`,
      },
    },
  };

  const series = [{ name: `${ticker} Price`, data: values }];

  return (
    <div className="w-full h-[380px] bg-[#0c0c0e]/40 p-[32px] rounded-[16px] border border-zinc-800 flex flex-col justify-between shadow-md">
      <h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">1-Year Historical Price</h3>
      <div className="w-full h-[260px] mt-[16px]">
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
    colors: ['#eab308'],
    stroke: {
      show: true,
      width: 2,
      colors: ['#eab308'],
    },
    fill: {
      opacity: 0.2,
      colors: ['#eab308'],
    },
    markers: {
      size: 4,
      colors: ['#060608'],
      strokeColors: '#eab308',
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
          colors: ['#71717a', '#71717a', '#71717a', '#71717a', '#71717a', '#71717a'],
          fontSize: '10px',
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
    <div className="w-full h-[380px] bg-[#0c0c0e]/40 p-[32px] rounded-[16px] border border-zinc-800 flex flex-col justify-between shadow-md">
      <h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Financial Radar Matrix</h3>
      <div className="w-full h-[260px] mt-[16px] flex items-center justify-center">
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
    colors: ['#06b6d4', '#eab308', '#3b82f6'],
    stroke: {
      curve: 'straight',
      width: 2,
    },
    xaxis: {
      categories: years,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${val.toFixed(1)}%`,
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#27272a/40',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      fontWeight: 600,
      labels: {
        colors: '#a1a1aa',
      },
    },
  };

  const series = [
    { name: 'Gross Margin', data: grossMargins },
    { name: 'EBITDA Margin', data: ebitdaMargins },
    { name: 'Net Profit Margin', data: netMargins },
  ];

  return (
    <div className="w-full h-[380px] bg-[#0c0c0e]/40 p-[32px] rounded-[16px] border border-zinc-800 flex flex-col justify-between shadow-md">
      <h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest">Profitability Margins</h3>
      <div className="w-full h-[260px] mt-[16px]">
        <Chart options={options} series={series} type="line" height="100%" />
      </div>
    </div>
  );
}
