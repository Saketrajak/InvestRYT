"use client";

// ============================================================
// Investryt AI — Dynamic Peer Comparison (Refined UI)
// ============================================================

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Plus, Trash2, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import type { KeyMetrics } from '../../types/index.js';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface PeerEntry {
  symbol: string;
  name: string;
  metrics: KeyMetrics;
}

interface PeerComparisonProps {
  targetTicker: string;
  targetName: string;
  targetMetrics: KeyMetrics;
}

export default function PeerComparison({
  targetTicker,
  targetName,
  targetMetrics,
}: PeerComparisonProps) {
  const [peers, setPeers] = useState<PeerEntry[]>([]);
  const [peerInput, setPeerInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPeer = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = peerInput.trim().toUpperCase();
    if (!symbol) return;

    // Check if peer is already added
    if (peers.some((p) => p.symbol.toUpperCase() === symbol) || symbol === targetTicker.toUpperCase()) {
      setError(`${symbol} is already in the comparison list.`);
      return;
    }

    setFetching(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/peer?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        throw new Error(res.status === 404 ? `Symbol ${symbol} not found.` : 'Failed to fetch peer data.');
      }
      const data = await res.json();
      setPeers((prev) => [...prev, data]);
      setPeerInput('');
    } catch (err: any) {
      console.error('[PeerComparison] Error adding competitor:', err);
      setError(err.message || 'Error fetching competitor multiples.');
    } finally {
      setFetching(false);
    }
  };

  const handleRemovePeer = (idx: number) => {
    setPeers((prev) => prev.filter((_, i) => i !== idx));
  };

  // Compile datasets for charts
  const chartCategories = [targetTicker, ...peers.map((p) => p.symbol)];
  const peValues = [targetMetrics.peRatio || 0, ...peers.map((p) => p.metrics.peRatio || 0)];
  const roeValues = [targetMetrics.roe ? targetMetrics.roe * 100 : 0, ...peers.map((p) => (p.metrics.roe ? p.metrics.roe * 100 : 0))];
  const pbValues = [targetMetrics.pbRatio || 0, ...peers.map((p) => p.metrics.pbRatio || 0)];

  const buildChartOptions = (title: string, color: string): ApexCharts.ApexOptions => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: [color],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '35%',
        borderRadius: 4,
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartCategories,
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
        style: {
          colors: '#71717a',
          fontFamily: 'var(--font-body)',
        },
      },
    },
    grid: {
      borderColor: '#27272a/45',
      strokeDashArray: 4,
    },
    legend: { show: false },
    tooltip: {
      theme: 'dark',
    }
  });

  return (
    <div className="flex flex-col gap-[32px]">
      
      {/* Search Input Box */}
      <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] flex flex-col gap-[16px] shadow-sm">
        <div>
          <h3 className="text-[16px] font-bold text-white uppercase tracking-wider">Build Peer Comparison Panel</h3>
          <p className="text-[12px] text-zinc-500 font-light mt-[4px]">
            Fetch comparative valuation multiples dynamically from Yahoo Finance. Enter ticker code (e.g. MSFT, GOOG, TCS.NS)
          </p>
        </div>

        <form onSubmit={handleAddPeer} className="flex gap-[12px] max-w-md w-full">
          <input
            type="text"
            placeholder="Enter peer symbol (e.g., MSFT)..."
            value={peerInput}
            onChange={(e) => setPeerInput(e.target.value)}
            disabled={fetching}
            className="flex-1 h-[44px] bg-[#060608] border border-zinc-800 focus:border-cyan-500 rounded-[12px] text-[14px] px-[16px] outline-none text-white font-mono placeholder-zinc-650 transition-colors"
          />
          <button
            type="submit"
            disabled={fetching || !peerInput.trim()}
            className="h-[44px] px-[20px] bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-900 disabled:text-zinc-600 text-white rounded-[12px] font-bold text-[12px] uppercase tracking-widest transition-all duration-200 flex items-center gap-[8px] shrink-0 justify-center cursor-pointer"
          >
            {fetching ? <Loader2 className="h-[14px] w-[14px] animate-spin" /> : <Plus className="h-[14px] w-[14px]" />}
            <span>Add Peer</span>
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-[8px] text-red-400 text-[12px] bg-red-500/5 p-[12px] rounded-[12px] border border-red-500/10 self-start">
            <AlertCircle className="h-[14px] w-[14px] shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Active Peer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
        {/* Target Stock */}
        <div className="bg-cyan-950/5 border border-cyan-500/20 p-[24px] rounded-[16px] relative flex flex-col justify-between min-h-[140px]">
          <span className="absolute top-[16px] right-[16px] text-[8px] font-black text-cyan-400 border border-cyan-500/25 bg-cyan-500/10 px-[10px] py-[3px] rounded-lg uppercase tracking-wider select-none">
            Target
          </span>
          <div className="min-w-0 pr-[64px]">
            <h4 className="font-bold text-white text-[16px] truncate">{targetName}</h4>
            <span className="text-zinc-500 text-[12px] font-mono">{targetTicker}</span>
          </div>
          <div className="mt-[20px] flex gap-[24px] text-[12px] font-medium text-zinc-400 border-t border-zinc-850 pt-[12px]">
            <div>P/E: <strong className="text-white font-bold">{targetMetrics.peRatio?.toFixed(1) || 'N/A'}</strong></div>
            <div>ROE: <strong className="text-white font-bold">{targetMetrics.roe ? `${(targetMetrics.roe * 100).toFixed(1)}%` : 'N/A'}</strong></div>
            <div>P/B: <strong className="text-white font-bold">{targetMetrics.pbRatio?.toFixed(1) || 'N/A'}</strong></div>
          </div>
        </div>

        {/* Competitor Peers */}
        {peers.map((peer, idx) => (
          <div key={idx} className="bg-[#0c0c0e]/40 border border-zinc-800 p-[24px] rounded-[16px] relative group flex flex-col justify-between min-h-[140px] hover:border-zinc-700 transition-colors duration-300">
            <button
              onClick={() => handleRemovePeer(idx)}
              className="absolute top-[16px] right-[16px] text-zinc-600 hover:text-red-400 transition-colors duration-200 p-1 cursor-pointer"
              title="Remove peer"
            >
              <Trash2 className="h-[14px] w-[14px]" />
            </button>
            <div className="min-w-0 pr-[32px]">
              <h4 className="font-bold text-white text-[16px] truncate">{peer.name}</h4>
              <span className="text-zinc-500 text-[12px] font-mono">{peer.symbol}</span>
            </div>
            <div className="mt-[20px] flex gap-[24px] text-[12px] font-medium text-zinc-400 border-t border-zinc-850 pt-[12px]">
              <div>P/E: <strong className="text-white font-bold">{peer.metrics.peRatio?.toFixed(1) || 'N/A'}</strong></div>
              <div>ROE: <strong className="text-white font-bold">{peer.metrics.roe ? `${(peer.metrics.roe * 100).toFixed(1)}%` : 'N/A'}</strong></div>
              <div>P/B: <strong className="text-white font-bold">{peer.metrics.pbRatio?.toFixed(1) || 'N/A'}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Multiples Charts */}
      {peers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px] items-stretch">
          
          <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[32px] rounded-[16px] flex flex-col justify-between shadow-sm min-h-[360px]">
            <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-[8px]">
              P/E Ratio Comparison
            </h4>
            <div className="h-[220px] mt-[20px]">
              <Chart options={buildChartOptions('PE', '#06b6d4')} series={[{ name: 'P/E', data: peValues }]} type="bar" height="100%" />
            </div>
          </div>

          <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[32px] rounded-[16px] flex flex-col justify-between shadow-sm min-h-[360px]">
            <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-[8px]">
              ROE (%) Comparison
            </h4>
            <div className="h-[220px] mt-[20px]">
              <Chart options={buildChartOptions('ROE', '#eab308')} series={[{ name: 'ROE (%)', data: roeValues }]} type="bar" height="100%" />
            </div>
          </div>

          <div className="bg-[#0c0c0e]/40 border border-zinc-800 p-[32px] rounded-[16px] flex flex-col justify-between shadow-sm min-h-[360px]">
            <h4 className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-[8px]">
              P/B Ratio Comparison
            </h4>
            <div className="h-[220px] mt-[20px]">
              <Chart options={buildChartOptions('PB', '#3b82f6')} series={[{ name: 'P/B', data: pbValues }]} type="bar" height="100%" />
            </div>
          </div>

        </div>
      ) : (
        <div className="w-full bg-[#0c0c0e]/40 border border-zinc-800 rounded-[16px] p-[64px] flex flex-col items-center justify-center text-center gap-[20px] shadow-md">
          <div className="p-[20px] bg-cyan-500/5 rounded-full border border-cyan-500/10">
            <BarChart3 className="h-[40px] w-[40px] text-cyan-400 animate-pulse" />
          </div>
          <div className="max-w-[440px]">
            <h4 className="text-[16px] font-bold text-white uppercase tracking-wider">No Competitors Added</h4>
            <p className="text-[14px] text-zinc-500 font-light mt-[8px] leading-relaxed">
              Add competitor stock tickers above (e.g. MSFT, GOOG, TCS.NS) to dynamically compile comparative multiples and side-by-side multiple comparison charts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
