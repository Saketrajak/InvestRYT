// ============================================================
// Investryt AI — Financial Modeling Prep (FMP) Service
// ============================================================
// Handles all FMP API calls for US stock data.
// Uses API key pool with auto-rotation.

import { getFmpPool } from './keyPool.js';
import { cache } from './cacheService.js';
import type {
  CompanyProfile,
  IncomeStatementEntry,
  BalanceSheetEntry,
  CashFlowEntry,
  KeyMetrics,
  StockPriceEntry,
} from '../types/index.js';

const FMP_BASE = 'https://financialmodelingprep.com/api/v3';

async function fmpFetch<T>(endpoint: string): Promise<T | null> {
  const pool = getFmpPool();
  const key = pool.getKey();
  const url = `${FMP_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${key}`;

  try {
    const res = await fetch(url);

    if (res.status === 429) {
      pool.markRateLimited(key, 60_000);
      // Retry with next key
      const retryKey = pool.getKey();
      const retryUrl = `${FMP_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${retryKey}`;
      const retryRes = await fetch(retryUrl);
      if (!retryRes.ok) return null;
      return retryRes.json() as Promise<T>;
    }

    if (!res.ok) {
      console.error(`[FMP] ${endpoint} returned ${res.status}`);
      return null;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`[FMP] Error fetching ${endpoint}:`, err);
    return null;
  }
}

// ---- Company Search ----
export async function searchCompany(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const cacheKey = cache.key('fmp', 'search', query);
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<any[]>(`/search?query=${encodeURIComponent(query)}&limit=5`);
  if (!data) return [];

  const results = data.map((item: any) => ({
    symbol: item.symbol,
    name: item.name,
    exchange: item.exchangeShortName || item.exchange || '',
  }));

  cache.set(cacheKey, results, 120);
  return results;
}

// ---- Company Profile ----
export async function getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
  const cacheKey = cache.key('fmp', 'profile', ticker);
  const cached = cache.get<CompanyProfile>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<any[]>(`/profile/${ticker}`);
  if (!data || data.length === 0) return null;

  const p = data[0];
  const profile: CompanyProfile = {
    name: p.companyName || '',
    ticker: p.symbol || ticker,
    exchange: p.exchangeShortName || p.exchange || '',
    sector: p.sector || '',
    industry: p.industry || '',
    description: p.description || '',
    marketCap: p.mktCap || null,
    currency: p.currency || 'USD',
    country: p.country || '',
    website: p.website || '',
    employees: p.fullTimeEmployees || null,
    ipoDate: p.ipoDate || '',
    image: p.image || '',
  };

  cache.set(cacheKey, profile);
  return profile;
}

// ---- Income Statements ----
export async function getIncomeStatements(ticker: string, limit: number = 5): Promise<IncomeStatementEntry[]> {
  const cacheKey = cache.key('fmp', 'income', ticker);
  const cached = cache.get<IncomeStatementEntry[]>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<any[]>(`/income-statement/${ticker}?limit=${limit}`);
  if (!data) return [];

  const statements: IncomeStatementEntry[] = data.map((item: any) => ({
    date: item.date || '',
    period: item.period || 'FY',
    revenue: item.revenue || 0,
    costOfRevenue: item.costOfRevenue || 0,
    grossProfit: item.grossProfit || 0,
    grossProfitRatio: item.grossProfitRatio || 0,
    operatingExpenses: item.operatingExpenses || 0,
    operatingIncome: item.operatingIncome || 0,
    operatingIncomeRatio: item.operatingIncomeRatio || 0,
    ebitda: item.ebitda || 0,
    ebitdaRatio: item.ebitdaratio || 0,
    netIncome: item.netIncome || 0,
    netIncomeRatio: item.netIncomeRatio || 0,
    eps: item.eps || 0,
    sgaExpenses: item.sellingGeneralAndAdministrativeExpenses || 0,
    rdExpenses: item.researchAndDevelopmentExpenses || 0,
  }));

  cache.set(cacheKey, statements);
  return statements;
}

// ---- Balance Sheet ----
export async function getBalanceSheets(ticker: string, limit: number = 5): Promise<BalanceSheetEntry[]> {
  const cacheKey = cache.key('fmp', 'balance', ticker);
  const cached = cache.get<BalanceSheetEntry[]>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<any[]>(`/balance-sheet-statement/${ticker}?limit=${limit}`);
  if (!data) return [];

  const sheets: BalanceSheetEntry[] = data.map((item: any) => ({
    date: item.date || '',
    totalAssets: item.totalAssets || 0,
    totalLiabilities: item.totalLiabilities || 0,
    totalEquity: item.totalStockholdersEquity || 0,
    totalDebt: item.totalDebt || 0,
    cashAndEquivalents: item.cashAndCashEquivalents || 0,
    currentAssets: item.totalCurrentAssets || 0,
    currentLiabilities: item.totalCurrentLiabilities || 0,
  }));

  cache.set(cacheKey, sheets);
  return sheets;
}

// ---- Cash Flow ----
export async function getCashFlows(ticker: string, limit: number = 5): Promise<CashFlowEntry[]> {
  const cacheKey = cache.key('fmp', 'cashflow', ticker);
  const cached = cache.get<CashFlowEntry[]>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<any[]>(`/cash-flow-statement/${ticker}?limit=${limit}`);
  if (!data) return [];

  const flows: CashFlowEntry[] = data.map((item: any) => ({
    date: item.date || '',
    operatingCashFlow: item.operatingCashFlow || 0,
    capitalExpenditure: item.capitalExpenditure || 0,
    freeCashFlow: item.freeCashFlow || 0,
    dividendsPaid: item.dividendsPaid || 0,
  }));

  cache.set(cacheKey, flows);
  return flows;
}

// ---- Key Metrics ----
export async function getKeyMetrics(ticker: string): Promise<KeyMetrics | null> {
  const cacheKey = cache.key('fmp', 'metrics', ticker);
  const cached = cache.get<KeyMetrics>(cacheKey);
  if (cached) return cached;

  const [ratiosData, quoteData] = await Promise.all([
    fmpFetch<any[]>(`/ratios-ttm/${ticker}`),
    fmpFetch<any[]>(`/quote/${ticker}`),
  ]);

  const ratios = ratiosData?.[0] || {};
  const quote = quoteData?.[0] || {};

  const metrics: KeyMetrics = {
    peRatio: ratios.peRatioTTM || quote.pe || null,
    forwardPE: null, // FMP doesn't always provide this
    pbRatio: ratios.priceToBookRatioTTM || null,
    pegRatio: ratios.pegRatioTTM || null,
    roe: ratios.returnOnEquityTTM || null,
    roce: ratios.returnOnCapitalEmployedTTM || null,
    roa: ratios.returnOnAssetsTTM || null,
    debtToEquity: ratios.debtEquityRatioTTM || null,
    currentRatio: ratios.currentRatioTTM || null,
    dividendYield: ratios.dividendYieldTTM || quote.dividendYield || null,
    evToEbitda: ratios.enterpriseValueOverEBITDATTM || null,
    priceToSales: ratios.priceToSalesRatioTTM || null,
    beta: quote.beta || null,
    fiftyTwoWeekHigh: quote.yearHigh || null,
    fiftyTwoWeekLow: quote.yearLow || null,
    currentPrice: quote.price || null,
    targetPrice: null, // FMP quote endpoint doesn't provide analyst targets; Yahoo fallback fills this
  };

  cache.set(cacheKey, metrics, 30); // Cache for 30 min (price-sensitive)
  return metrics;
}

// ---- Historical Prices ----
export async function getHistoricalPrices(ticker: string): Promise<StockPriceEntry[]> {
  const cacheKey = cache.key('fmp', 'prices', ticker);
  const cached = cache.get<StockPriceEntry[]>(cacheKey);
  if (cached) return cached;

  const data = await fmpFetch<{ historical: any[] }>(`/historical-price-full/${ticker}?timeseries=365`);
  if (!data?.historical) return [];

  const prices: StockPriceEntry[] = data.historical.map((item: any) => ({
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume,
  })).reverse(); // Chronological order

  cache.set(cacheKey, prices, 30);
  return prices;
}
