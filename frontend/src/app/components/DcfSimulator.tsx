"use client";

// ============================================================
// Investryt AI — Interactive WACC/DCF Valuation Simulator (Refined)
// ============================================================

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sliders, RefreshCw, BarChart2, CheckCircle2, AlertTriangle } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DcfSimulatorProps {
  initialFcf: number;
  cash: number;
  debt: number;
  marketCap: number;
  currentPrice: number;
  currency: string;
  market?: 'US' | 'INDIA' | 'GLOBAL';
}

export default function DcfSimulator({
  initialFcf,
  cash,
  debt,
  marketCap,
  currentPrice,
  currency,
  market,
}: DcfSimulatorProps) {
  // Simulator Sliders States
  const [growthRate, setGrowthRate] = useState(7.0); // Revenue/FCF CAGR (%)
  const [wacc, setWacc] = useState(market === 'INDIA' ? 12.0 : 9.0); // Discount Rate (%)
  const [terminalGrowth, setTerminalGrowth] = useState(2.5); // Perpetuity growth (%)

  // Update default states when market or target stock changes
  useEffect(() => {
    const defaultWacc = market === 'INDIA' ? 12.0 : 9.0;
    setWacc(defaultWacc);
    setGrowthRate(7.0);
    setTerminalGrowth(2.5);
  }, [market, initialFcf]);

  // Calculation Results States
  const [projectedFcfs, setProjectedFcfs] = useState<number[]>([]);
  const [pvFcfs, setPvFcfs] = useState<number[]>([]);
  const [terminalValue, setTerminalValue] = useState(0);
  const [pvTerminalValue, setPvTerminalValue] = useState(0);
  const [enterpriseValue, setEnterpriseValue] = useState(0);
  const [equityValue, setEquityValue] = useState(0);
  const [fairValuePerShare, setFairValuePerShare] = useState(0);

  // Formatting Helper
  const formatVal = (val: number) => {
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

  // Run DCF calculations whenever sliders change
  useEffect(() => {
    const sharesOutstanding = marketCap && currentPrice ? marketCap / currentPrice : 1;
    const baseFcf = initialFcf > 0 ? initialFcf : Math.max(marketCap * 0.05, 1_000_000);

    const g = growthRate / 100;
    const discount = wacc / 100;
    const tg = terminalGrowth / 100;

    const denominator = discount - tg;
    const safeDenominator = denominator <= 0 ? 0.01 : denominator;

    const fcfs: number[] = [];
    const pvs: number[] = [];
    let sumPvFcfs = 0;

    for (let t = 1; t <= 5; t++) {
      const fcf = baseFcf * Math.pow(1 + g, t);
      const pv = fcf / Math.pow(1 + discount, t);
      fcfs.push(fcf);
      pvs.push(pv);
      sumPvFcfs += pv;
    }

    const tv = (fcfs[4] * (1 + tg)) / safeDenominator;
    const pvTv = tv / Math.pow(1 + discount, 5);

    const ev = sumPvFcfs + pvTv;
    const eqVal = ev + cash - debt;
    const priceShare = eqVal / sharesOutstanding;

    setProjectedFcfs(fcfs);
    setPvFcfs(pvs);
    setTerminalValue(tv);
    setPvTerminalValue(pvTv);
    setEnterpriseValue(ev);
    setEquityValue(eqVal);
    setFairValuePerShare(priceShare);
  }, [growthRate, wacc, terminalGrowth, initialFcf, cash, debt, marketCap, currentPrice]);

  const handleReset = () => {
    setGrowthRate(7.0);
    setWacc(market === 'INDIA' ? 12.0 : 9.0);
    setTerminalGrowth(2.5);
  };

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#06b6d4', '#eab308'],
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: {
      categories: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      labels: {
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatVal(val),
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#27272a/40',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'var(--font-body)',
      fontSize: '11px',
      labels: { colors: '#a1a1aa' },
    },
    tooltip: {
      theme: 'dark',
    }
  };

  const chartSeries = [
    { name: 'Projected FCF', data: projectedFcfs.map((v) => Math.round(v)) },
    { name: 'Present Value (PV)', data: pvFcfs.map((v) => Math.round(v)) },
  ];

  const premiumDiff = fairValuePerShare - currentPrice;
  const premiumPct = currentPrice ? (premiumDiff / currentPrice) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
      
      {/* LEFT: Inputs & Simulators Column */}
      <div className="lg:col-span-5 flex flex-col gap-[24px]">
        
        {/* Card A: DCF Parameters */}
        <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[20px] shadow-sm">
          <div className="flex justify-between items-center border-b border-zinc-850 pb-[12px]">
            <h3 className="text-[14px] font-bold text-white flex items-center gap-[8px] uppercase tracking-wider">
              <Sliders className="h-[16px] w-[16px] text-cyan-450" />
              Simulation Sliders
            </h3>
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-zinc-900 rounded-lg transition-colors text-zinc-550 hover:text-white cursor-pointer"
              title="Reset parameters"
            >
              <RefreshCw className="h-[14px] w-[14px]" />
            </button>
          </div>

          {/* Slider 1: Growth Rate */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between text-[12px] font-semibold text-zinc-400">
              <span>FCF Growth CAGR (5-Year)</span>
              <span className="text-cyan-400 font-bold">{growthRate.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={growthRate}
              onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-650 font-medium select-none">
              <span>1.5% (Bear)</span>
              <span>15.0% (Base)</span>
              <span>30.0% (Bull)</span>
            </div>
          </div>

          {/* Slider 2: WACC */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between text-[12px] font-semibold text-zinc-400">
              <span>Discount Rate (WACC)</span>
              <span className="text-yellow-550 font-bold">{wacc.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={wacc}
              onChange={(e) => setWacc(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-yellow-550"
            />
            <div className="flex justify-between text-[10px] text-zinc-650 font-medium select-none">
              <span>5.0% (Low Risk)</span>
              <span>10.0% (Avg)</span>
              <span>20.0% (High Risk)</span>
            </div>
          </div>

          {/* Slider 3: perpetuity growth */}
          <div className="flex flex-col gap-[8px]">
            <div className="flex justify-between text-[12px] font-semibold text-zinc-400">
              <span>Perpetuity Growth Rate (g)</span>
              <span className="text-purple-400 font-bold">{terminalGrowth.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={terminalGrowth}
              onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-650 font-medium select-none">
              <span>0.0% (Stagnation)</span>
              <span>2.5% (Inflation)</span>
              <span>5.0% (Max)</span>
            </div>
          </div>
        </div>

        {/* Card B: Base Financials Summary */}
        <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[12px] shadow-sm">
          <h3 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-850 pb-[8px]">
            Model Base Metrics
          </h3>
          <div className="flex flex-col gap-[10px] text-[12px] text-zinc-400 font-light mt-1">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Base FCF:</span>
              <span className="text-white font-bold">{formatVal(initialFcf)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Add Cash & Equiv:</span>
              <span className="text-emerald-400 font-bold">+{formatVal(cash)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Less Total Debt:</span>
              <span className="text-red-400 font-bold">-{formatVal(debt)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT: Output Result & Projection Charts Column */}
      <div className="lg:col-span-7 flex flex-col gap-[24px]">
        
        {/* Card C: Valuation Output */}
        <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col md:flex-row justify-between items-start md:items-center gap-[24px] shadow-md relative overflow-hidden">
          
          {/* Subtle colored accent strip based on valuation */}
          <div className={`absolute top-0 bottom-0 left-0 w-[4px] ${premiumPct >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />

          <div className="flex flex-col gap-[6px] pl-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Estimated Intrinsic Fair Value</span>
            <h2 className="text-[38px] font-black text-white tracking-tight leading-none mt-1">
              {fairValuePerShare > 0 ? `${currency === 'INR' ? '₹' : '$'}${fairValuePerShare.toFixed(2)}` : 'N/A'}
            </h2>
            <div className="text-[12px] text-zinc-500 font-medium mt-[6px]">
              Current Market Price: <span className="text-zinc-300">{currency === 'INR' ? '₹' : '$'}{currentPrice}</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end md:text-right pr-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Valuation Pricing Margin</span>
            {premiumPct >= 0 ? (
              <div className="text-[18px] font-bold text-emerald-400 flex items-center gap-[6px] mt-2">
                <CheckCircle2 className="h-[18px] w-[18px] shrink-0" />
                <span>Undervalued by +{premiumPct.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="text-[18px] font-bold text-red-400 flex items-center gap-[6px] mt-2">
                <AlertTriangle className="h-[18px] w-[18px] shrink-0" />
                <span>Overvalued by {premiumPct.toFixed(1)}%</span>
              </div>
            )}
            <span className="text-[10px] text-zinc-500 font-light mt-[4px]">Implied margin of safety relative to market pricing</span>
          </div>
        </div>

        {/* Card D: Projections Chart */}
        <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[32px] rounded-[16px] flex flex-col justify-between shadow-sm min-h-[350px]">
          <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-[8px]">
            FCF Projections Chart (5-Year Horizon)
          </h4>
          <div className="h-[210px] mt-[16px]">
            <Chart options={chartOptions} series={chartSeries} type="line" height="100%" />
          </div>
        </div>

      </div>

    </div>
  );
}
