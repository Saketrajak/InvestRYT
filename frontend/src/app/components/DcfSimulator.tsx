"use client";

// ============================================================
// Investryt AI — Interactive WACC/DCF Valuation Simulator
// ============================================================

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sliders, RefreshCw, BarChart2, CheckCircle2 } from 'lucide-react';

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
    // 1. Estimate shares outstanding: Market Cap / Current Price
    const sharesOutstanding = marketCap && currentPrice ? marketCap / currentPrice : 1;

    // Use absolute FCF as base, fallback to average if negative or zero
    const baseFcf = initialFcf > 0 ? initialFcf : Math.max(marketCap * 0.05, 1_000_000);

    const g = growthRate / 100;
    const discount = wacc / 100;
    const tg = terminalGrowth / 100;

    // Avoid divide-by-zero or negative denominator
    const denominator = discount - tg;
    const safeDenominator = denominator <= 0 ? 0.01 : denominator;

    // 2. Project 5 years cash flows
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

    // 3. Terminal Value
    const tv = (fcfs[4] * (1 + tg)) / safeDenominator;
    const pvTv = tv / Math.pow(1 + discount, 5);

    // 4. Valuation Sums
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

  // Chart configuration
  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: ['#14b8a6', '#f59e0b'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      labels: {
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatVal(val),
        style: {
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#232326',
      strokeDashArray: 4,
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#f4f4f5' },
    },
  };

  const chartSeries = [
    { name: 'Projected FCF', data: projectedFcfs.map((v) => Math.round(v)) },
    { name: 'Present Value (PV)', data: pvFcfs.map((v) => Math.round(v)) },
  ];

  const premiumDiff = fairValuePerShare - currentPrice;
  const premiumPct = currentPrice ? (premiumDiff / currentPrice) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Input Sliders Box */}
      <div className="lg:col-span-5 bg-[#141416] border border-[#232326] p-6 rounded-xl flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-[#232326] pb-3">
          <h3 className="text-md font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal-400" />
            Interactive Parameters
          </h3>
          <button
            onClick={handleReset}
            className="p-1 hover:bg-[#232326] rounded-md transition-all text-zinc-500 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Slider 1: Growth Rate */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <span>Projected Growth CAGR (5-Year)</span>
            <span className="text-teal-400 font-bold">{growthRate.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            step="0.5"
            value={growthRate}
            onChange={(e) => setGrowthRate(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-teal-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>1.0% (Bear)</span>
            <span>15.0% (Base)</span>
            <span>30.0% (Bull)</span>
          </div>
        </div>

        {/* Slider 2: WACC */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <span>Discount Rate (WACC)</span>
            <span className="text-amber-500 font-bold">{wacc.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="20"
            step="0.1"
            value={wacc}
            onChange={(e) => setWacc(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>5.0% (Low Risk)</span>
            <span>10.0% (Average)</span>
            <span>20.0% (High Risk)</span>
          </div>
        </div>

        {/* Slider 3: Perpetuity growth tg */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <span>Perpetuity Growth Rate (g)</span>
            <span className="text-blue-400 font-bold">{terminalGrowth.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={terminalGrowth}
            onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-blue-400"
          />
          <div className="flex justify-between text-[10px] text-zinc-600">
            <span>0.0% (Stagnation)</span>
            <span>2.5% (Inflation)</span>
            <span>5.0% (Max)</span>
          </div>
        </div>

        {/* Key Model Inputs Summary */}
        <div className="bg-[#09090b] border border-[#232326] p-4 rounded-lg flex flex-col gap-2 text-xs text-zinc-400 leading-normal font-light">
          <div className="flex justify-between"><span className="text-zinc-500">Base Free Cash Flow:</span> <span className="text-white font-bold">{formatVal(initialFcf)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">Add Cash & Equiv:</span> <span className="text-emerald-400 font-bold">+{formatVal(cash)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-500">Less Total Debt:</span> <span className="text-red-400 font-bold">-{formatVal(debt)}</span></div>
        </div>
      </div>

      {/* Right Output Projections Dashboard */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Intrinsic Valuation Output Badge */}
        <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Estimated Intrinsic Fair Value</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              {fairValuePerShare > 0 ? `${currency === 'INR' ? '₹' : '$'}${fairValuePerShare.toFixed(2)}` : 'N/A'}
            </h2>
            <div className="text-xs text-zinc-400 font-light mt-1">
              Current Market Price: <span className="text-white font-semibold">{currency === 'INR' ? '₹' : '$'}{currentPrice}</span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Valuation Pricing Margin</span>
            {premiumPct >= 0 ? (
              <div className="text-lg font-bold text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>Undervalued by +{premiumPct.toFixed(1)}%</span>
              </div>
            ) : (
              <div className="text-lg font-bold text-red-400 flex items-center gap-1 mt-1">
                <span>Overvalued by {premiumPct.toFixed(1)}%</span>
              </div>
            )}
            <span className="text-[10px] text-zinc-500 font-light mt-0.5">Implied margin of safety relative to market pricing</span>
          </div>
        </div>

        {/* Projection Chart */}
        <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl">
          <h4 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-teal-400" /> FCF Projections Chart (5-Year Horizon)
          </h4>
          <div className="h-56">
            <Chart options={chartOptions} series={chartSeries} type="line" height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}
