// ============================================================
// Investryt AI — Yahoo Finance Service
// ============================================================
// Handles all Yahoo Finance API calls for Indian & Global stocks.
// Uses the yahoo-finance2 library (no API key required).

import YahooFinance from 'yahoo-finance2';
import { cache } from './cacheService.js';
import type {
  CompanyProfile,
  IncomeStatementEntry,
  BalanceSheetEntry,
  CashFlowEntry,
  KeyMetrics,
  StockPriceEntry,
} from '../types/index.js';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// ---- Company Search ----
export async function searchCompany(query: string): Promise<{ symbol: string; name: string; exchange: string }[]> {
  const cacheKey = cache.key('yahoo', 'search', query);
  const cached = cache.get<any[]>(cacheKey);
  if (cached) return cached;

  try {
    const results = await yahooFinance.search(query, {
      newsCount: 0,
      quotesCount: 5,
    });

    if (!results || !results.quotes) return [];

    const mapped = results.quotes
      .filter((q: any) => q.symbol)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || q.market || '',
      }));

    cache.set(cacheKey, mapped, 120);
    return mapped;
  } catch (err) {
    console.error(`[Yahoo] Search error for ${query}:`, err);
    return [];
  }
}

// ---- Company Profile ----
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  const cacheKey = cache.key('yahoo', 'profile', symbol);
  const cached = cache.get<CompanyProfile>(cacheKey);
  if (cached) return cached;

  try {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ['summaryProfile'],
      }).catch(() => null),
    ]);

    if (!quote) return null;

    const sp = (summary?.summaryProfile || {}) as any;

    const profile: CompanyProfile = {
      name: quote.longName || quote.shortName || symbol,
      ticker: quote.symbol || symbol,
      exchange: quote.fullExchangeName || quote.exchange || '',
      sector: sp.sector || '',
      industry: sp.industry || '',
      description: sp.longBusinessSummary || '',
      marketCap: quote.marketCap || null,
      currency: quote.currency || 'USD', // Default to USD (safer fallback than INR for global coverage)
      country: sp.country || '',
      website: sp.website || '',
      employees: sp.fullTimeEmployees || null,
      ipoDate: '', // Not easily available in quote/summaryProfile
      image: '', // No logos in Yahoo Finance API
    };

    cache.set(cacheKey, profile);
    return profile;
  } catch (err) {
    console.error(`[Yahoo] Profile error for ${symbol}:`, err);
    return null;
  }
}

// ---- Income Statements ----
export async function getIncomeStatements(symbol: string): Promise<IncomeStatementEntry[]> {
  const cacheKey = cache.key('yahoo', 'income', symbol);
  const cached = cache.get<IncomeStatementEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const data = await yahooFinance.fundamentalsTimeSeries(symbol, {
      period1: Math.floor(fiveYearsAgo.getTime() / 1000),
      period2: Math.floor(today.getTime() / 1000),
      type: 'annual',
      module: 'financials',
    });

    if (!data || data.length === 0) return [];

    const statements: IncomeStatementEntry[] = data.map((item: any) => {
      const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date);
      const rev = item.totalRevenue ?? 0;
      const cost = item.costOfRevenue ?? 0;
      const gp = item.grossProfit ?? (rev - cost);
      const opInc = item.operatingIncome ?? 0;
      const netInc = item.netIncome ?? 0;

      return {
        date: dateStr,
        period: 'FY',
        revenue: rev,
        costOfRevenue: cost,
        grossProfit: gp,
        grossProfitRatio: rev ? gp / rev : 0,
        operatingExpenses: item.operatingExpense ?? 0,
        operatingIncome: opInc,
        operatingIncomeRatio: rev ? opInc / rev : 0,
        ebitda: item.EBITDA ?? item.normalizedEBITDA ?? 0,
        ebitdaRatio: rev ? (item.EBITDA ?? item.normalizedEBITDA ?? 0) / rev : 0,
        netIncome: netInc,
        netIncomeRatio: rev ? netInc / rev : 0,
        eps: item.basicEPS ?? item.dilutedEPS ?? 0,
        sgaExpenses: item.sellingGeneralAndAdministration ?? 0,
        rdExpenses: item.researchAndDevelopment ?? 0,
      };
    });

    // Sort descending by date (newest first)
    statements.sort((a, b) => b.date.localeCompare(a.date));

    cache.set(cacheKey, statements);
    return statements;
  } catch (err) {
    console.error(`[Yahoo] Income statement error for ${symbol}:`, err);
    return [];
  }
}

// ---- Balance Sheet ----
export async function getBalanceSheets(symbol: string): Promise<BalanceSheetEntry[]> {
  const cacheKey = cache.key('yahoo', 'balance', symbol);
  const cached = cache.get<BalanceSheetEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const data = await yahooFinance.fundamentalsTimeSeries(symbol, {
      period1: Math.floor(fiveYearsAgo.getTime() / 1000),
      period2: Math.floor(today.getTime() / 1000),
      type: 'annual',
      module: 'balance-sheet',
    });

    if (!data || data.length === 0) return [];

    const sheets: BalanceSheetEntry[] = data.map((item: any) => {
      const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date);
      
      return {
        date: dateStr,
        totalAssets: item.totalAssets ?? 0,
        totalLiabilities: item.totalLiabilitiesNetMinorityInterest ?? item.totalLiabilities ?? 0,
        totalEquity: item.stockholdersEquity ?? item.totalStockholdersEquity ?? 0,
        totalDebt: item.totalDebt ?? 0,
        cashAndEquivalents: item.cashAndCashEquivalents ?? item.cashCashEquivalentsAndShortTermInvestments ?? 0,
        currentAssets: item.currentAssets ?? 0,
        currentLiabilities: item.currentLiabilities ?? 0,
      };
    });

    sheets.sort((a, b) => b.date.localeCompare(a.date));

    cache.set(cacheKey, sheets);
    return sheets;
  } catch (err) {
    console.error(`[Yahoo] Balance sheet error for ${symbol}:`, err);
    return [];
  }
}

// ---- Cash Flow ----
export async function getCashFlows(symbol: string): Promise<CashFlowEntry[]> {
  const cacheKey = cache.key('yahoo', 'cashflow', symbol);
  const cached = cache.get<CashFlowEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(today.getFullYear() - 5);

    const data = await yahooFinance.fundamentalsTimeSeries(symbol, {
      period1: Math.floor(fiveYearsAgo.getTime() / 1000),
      period2: Math.floor(today.getTime() / 1000),
      type: 'annual',
      module: 'cash-flow',
    });

    if (!data || data.length === 0) return [];

    const flows: CashFlowEntry[] = data.map((item: any) => {
      const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date);
      
      return {
        date: dateStr,
        operatingCashFlow: item.operatingCashFlow ?? 0,
        capitalExpenditure: Math.abs(item.capitalExpenditure ?? 0), // YF returns capEx as negative, we want positive/absolute format
        freeCashFlow: item.freeCashFlow ?? 0,
        dividendsPaid: Math.abs(item.commonStockDividendPaid ?? item.cashDividendsPaid ?? 0),
      };
    });

    flows.sort((a, b) => b.date.localeCompare(a.date));

    cache.set(cacheKey, flows);
    return flows;
  } catch (err) {
    console.error(`[Yahoo] Cash flow error for ${symbol}:`, err);
    return [];
  }
}

// ---- Key Metrics ----
export async function getKeyMetrics(symbol: string): Promise<KeyMetrics | null> {
  const cacheKey = cache.key('yahoo', 'metrics', symbol);
  const cached = cache.get<KeyMetrics>(cacheKey);
  if (cached) return cached;

  try {
    const [quote, summary] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: ['financialData', 'defaultKeyStatistics'],
      }).catch(() => null),
    ]);

    if (!quote) return null;

    const fd = (summary?.financialData || {}) as any;
    const ks = (summary?.defaultKeyStatistics || {}) as any;

    const metrics: KeyMetrics = {
      peRatio: quote.trailingPE ?? fd.peRatio ?? null,
      forwardPE: quote.forwardPE ?? ks.forwardPE ?? null,
      pbRatio: quote.priceToBook ?? ks.priceToBook ?? null,
      pegRatio: ks.pegRatio ?? null,
      roe: fd.returnOnEquity ?? null,
      roce: null, // Not standard in simple Quote/Summary
      roa: fd.returnOnAssets ?? null,
      debtToEquity: fd.debtToEquity ?? null,
      currentRatio: fd.currentRatio ?? null,
      dividendYield: quote.dividendYield ?? quote.trailingAnnualDividendYield ?? null,
      evToEbitda: ks.enterpriseToEbitda ?? null,
      priceToSales: ks.enterpriseToRevenue ?? null, // approximation if not present
      beta: ks.beta ?? quote.beta ?? null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
      currentPrice: quote.regularMarketPrice ?? fd.currentPrice ?? null,
      targetPrice: fd.targetMeanPrice ?? null,
    };

    cache.set(cacheKey, metrics, 30);
    return metrics;
  } catch (err) {
    console.error(`[Yahoo] Key metrics error for ${symbol}:`, err);
    return null;
  }
}

// ---- Historical Prices ----
export async function getHistoricalPrices(symbol: string): Promise<StockPriceEntry[]> {
  const cacheKey = cache.key('yahoo', 'prices', symbol);
  const cached = cache.get<StockPriceEntry[]>(cacheKey);
  if (cached) return cached;

  try {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 365);

    const data = await yahooFinance.historical(symbol, {
      period1: oneYearAgo.toISOString().split('T')[0],
      period2: today.toISOString().split('T')[0],
      interval: '1d',
    });

    if (!data || data.length === 0) return [];

    const prices: StockPriceEntry[] = data
      .filter((item: any) => item.date && item.close !== undefined)
      .map((item: any) => {
        const dateStr = item.date instanceof Date ? item.date.toISOString().split('T')[0] : String(item.date);
        return {
          date: dateStr,
          open: item.open ?? item.close,
          high: item.high ?? item.close,
          low: item.low ?? item.close,
          close: item.close,
          volume: item.volume ?? 0,
        };
      });

    // Already sorted ascending typically, but let's be sure
    prices.sort((a, b) => a.date.localeCompare(b.date));

    cache.set(cacheKey, prices, 30);
    return prices;
  } catch (err) {
    console.error(`[Yahoo] Historical prices error for ${symbol}:`, err);
    return [];
  }
}
