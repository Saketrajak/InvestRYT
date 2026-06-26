"use client";

// ============================================================
// Investryt AI — Dynamic Peer Comparison Component
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
  const roeValues = [targetMetrics.roe || 0, ...peers.map((p) => p.metrics.roe || 0)];
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
        columnWidth: '40%',
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
          colors: '#a1a1aa',
          fontFamily: 'var(--font-body)',
        },
      },
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
    },
    legend: { show: false },
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Search Input Box */}
      <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl">
        <h3 className="text-md font-bold text-white mb-2">Build Peer Comparison Panel</h3>
        <p className="text-xs text-zinc-500 font-light mb-4">
          Fetch comparative valuation multiples dynamically from Yahoo Finance. Enter ticker code (e.g. MSFT, GOOG, TCS.NS)
        </p>

        <form onSubmit={handleAddPeer} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="Enter peer symbol (e.g., MSFT)..."
            value={peerInput}
            onChange={(e) => setPeerInput(e.target.value)}
            disabled={fetching}
            className="flex-1 bg-[#09090b] border border-[#232326] focus:border-teal-500 rounded-lg text-sm px-4 py-2 outline-none text-white font-mono placeholder-zinc-600"
          />
          <button
            type="submit"
            disabled={fetching || !peerInput.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg font-semibold text-sm transition-all flex items-center gap-1 shrink-0 uppercase tracking-wider"
          >
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Peer
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs mt-3 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Active Peer Cards */}
      {peers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#141416]/50 border border-teal-500/30 p-4 rounded-xl relative">
            <span className="absolute top-2.5 right-3 text-[10px] font-bold text-teal-400 border border-teal-500/20 bg-teal-500/5 px-2 py-0.5 rounded uppercase tracking-wider">Target</span>
            <h4 className="font-bold text-white truncate max-w-[80%]">{targetName}</h4>
            <span className="text-zinc-500 text-xs font-mono">{targetTicker}</span>
            <div className="mt-4 flex gap-4 text-xs font-light">
              <div>P/E: <strong className="text-white font-bold">{targetMetrics.peRatio?.toFixed(1) || 'N/A'}</strong></div>
              <div>ROE: <strong className="text-white font-bold">{targetMetrics.roe ? `${targetMetrics.roe.toFixed(1)}%` : 'N/A'}</strong></div>
              <div>P/B: <strong className="text-white font-bold">{targetMetrics.pbRatio?.toFixed(1) || 'N/A'}</strong></div>
            </div>
          </div>

          {peers.map((peer, idx) => (
            <div key={idx} className="bg-[#141416]/50 border border-[#232326] p-4 rounded-xl relative group">
              <button
                onClick={() => handleRemovePeer(idx)}
                className="absolute top-2.5 right-3 text-zinc-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <h4 className="font-bold text-white truncate max-w-[80%]">{peer.name}</h4>
              <span className="text-zinc-500 text-xs font-mono">{peer.symbol}</span>
              <div className="mt-4 flex gap-4 text-xs font-light">
                <div>P/E: <strong className="text-white font-bold">{peer.metrics.peRatio?.toFixed(1) || 'N/A'}</strong></div>
                <div>ROE: <strong className="text-white font-bold">{peer.metrics.roe ? `${peer.metrics.roe.toFixed(1)}%` : 'N/A'}</strong></div>
                <div>P/B: <strong className="text-white font-bold">{peer.metrics.pbRatio?.toFixed(1) || 'N/A'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Multiples Charts */}
      {peers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl">
            <h4 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-teal-400" /> P/E Ratio Comparison
            </h4>
            <div className="h-56">
              <Chart options={buildChartOptions('PE', '#14b8a6')} series={[{ name: 'P/E', data: peValues }]} type="bar" height="100%" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl">
            <h4 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-amber-500" /> Return on Equity (ROE) Comparison
            </h4>
            <div className="h-56">
              <Chart options={buildChartOptions('ROE', '#f59e0b')} series={[{ name: 'ROE (%)', data: roeValues }]} type="bar" height="100%" />
            </div>
          </div>

          <div className="bg-[#141416] border border-[#232326] p-5 rounded-xl">
            <h4 className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-blue-500" /> Price to Book (P/B) Comparison
            </h4>
            <div className="h-56">
              <Chart options={buildChartOptions('PB', '#3b82f6')} series={[{ name: 'P/B', data: pbValues }]} type="bar" height="100%" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#141416]/50 border border-[#232326] rounded-xl p-12 text-center text-zinc-500">
          No peers added. Add competitor symbols above to unlock side-by-side interactive multiple charts!
        </div>
      )}
    </div>
  );
}
