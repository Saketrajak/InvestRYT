// ============================================================
// Investryt AI — Market Detector Utility
// ============================================================
// Determines which market a company belongs to (US, India, Global)
// so we can route to the optimal data source.

import type { MarketType } from '../types/index.js';

// Common Indian stock suffixes and exchanges
const INDIAN_SUFFIXES = ['.NS', '.BO', '.NSE', '.BSE'];
const INDIAN_EXCHANGES = ['NSE', 'BSE', 'NSEI', 'BSEI'];

// US exchanges
const US_EXCHANGES = ['NYSE', 'NASDAQ', 'AMEX', 'NYSEARCA', 'NYSEMKT', 'BATS', 'OTC'];

// Major Indian company name keywords (for name-based detection)
const INDIAN_COMPANY_HINTS = [
  'reliance', 'tata', 'infosys', 'wipro', 'hdfc', 'icici', 'kotak', 'bajaj',
  'bharti', 'airtel', 'maruti', 'suzuki', 'asian paints', 'hul', 'hindustan',
  'itc', 'adani', 'mahindra', 'sbi', 'axis bank', 'indusind', 'titan',
  'nestle india', 'britannia', 'cipla', 'sun pharma', 'dr reddy', 'dmart',
  'avenue supermarts', 'zomato', 'paytm', 'nykaa', 'ola', 'swiggy',
  'larsen', 'toubro', 'ultratech', 'grasim', 'hcl tech', 'tech mahindra',
  'power grid', 'ntpc', 'ongc', 'coal india', 'bhel', 'gail', 'ioc',
  'bpcl', 'vedanta', 'hindalco', 'jswsteel', 'jsw',
];

/**
 * Detect which market a company likely belongs to
 */
export function detectMarket(input: string): MarketType {
  const normalized = input.trim().toUpperCase();

  // Check for Indian ticker suffixes
  if (INDIAN_SUFFIXES.some(s => normalized.endsWith(s))) {
    return 'INDIA';
  }

  // Check for Indian company name hints
  const lowerInput = input.toLowerCase().trim();
  if (INDIAN_COMPANY_HINTS.some(hint => lowerInput.includes(hint))) {
    return 'INDIA';
  }

  // Check if input explicitly mentions an exchange
  for (const ex of INDIAN_EXCHANGES) {
    if (normalized.includes(ex)) return 'INDIA';
  }
  for (const ex of US_EXCHANGES) {
    if (normalized.includes(ex)) return 'US';
  }

  // Default: attempt as US first (most common use case), fallback logic handled by the agent
  return 'US';
}

/**
 * Convert company name/ticker to Yahoo Finance symbol format
 */
export function toYahooSymbol(ticker: string, market: MarketType): string {
  const cleaned = ticker.trim().toUpperCase();

  // Already has a suffix
  if (cleaned.includes('.')) return cleaned;

  switch (market) {
    case 'INDIA':
      return `${cleaned}.NS`; // Default to NSE
    case 'US':
      return cleaned; // Yahoo uses plain tickers for US
    case 'GLOBAL':
      return cleaned; // Will need exchange-specific handling
    default:
      return cleaned;
  }
}

/**
 * Format market cap for display
 */
export function formatMarketCap(value: number | null): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
}

/**
 * Format large numbers
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  if (Math.abs(value) >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  return value.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
}

/**
 * Format ratio (e.g., P/E)
 */
export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}x`;
}
