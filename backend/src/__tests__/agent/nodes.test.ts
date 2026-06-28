import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================
// Hoisted mocks — defined before vi.mock() factories run
// ============================================================
const { mockInvokeGemini, mockFmp, mockYahoo, mockSearchWeb, mockDetectMarket } = vi.hoisted(() => {
  return {
    mockInvokeGemini: vi.fn(),
    mockFmp: {
      searchCompany: vi.fn(),
      getCompanyProfile: vi.fn(),
      getIncomeStatements: vi.fn(),
      getBalanceSheets: vi.fn(),
      getCashFlows: vi.fn(),
      getKeyMetrics: vi.fn(),
      getHistoricalPrices: vi.fn(),
    },
    mockYahoo: {
      searchCompany: vi.fn(),
      getCompanyProfile: vi.fn(),
      getIncomeStatements: vi.fn(),
      getBalanceSheets: vi.fn(),
      getCashFlows: vi.fn(),
      getKeyMetrics: vi.fn(),
      getHistoricalPrices: vi.fn(),
    },
    mockSearchWeb: vi.fn(),
    mockDetectMarket: vi.fn(() => 'US'),
  };
});

// ============================================================
// Mock all external dependencies
// ============================================================
vi.mock('../../services/aiService.js', () => ({
  invokeGemini: mockInvokeGemini,
}));

vi.mock('../../services/fmpService.js', () => mockFmp);
vi.mock('../../services/yahooService.js', () => mockYahoo);

vi.mock('../../services/tavilyService.js', () => ({
  searchWeb: mockSearchWeb,
}));

vi.mock('../../utils/marketDetector.js', () => ({
  detectMarket: mockDetectMarket,
}));

// ============================================================
// Import AFTER mocks
// ============================================================
import {
  resolveCompanyNode,
  companyProfileNode,
  financialDataNode,
  marketDataNode,
  webResearchNode,
  newsSentimentNode,
  analysisNode,
  reportGenerationNode,
} from '../../agent/nodes/index.js';
import type { AgentStateType } from '../../agent/state.js';

// ============================================================
// Helpers
// ============================================================
function makeState(overrides: Partial<AgentStateType> = {}): AgentStateType {
  return {
    userInput: 'Apple',
    resolvedCompany: null,
    profile: null,
    financials: null,
    metrics: null,
    priceHistory: [],
    webResearchData: '',
    analysisText: '',
    newsItems: [],
    newsSummary: '',
    verdict: null,
    report: null,
    error: null,
    ...overrides,
  } as AgentStateType;
}

function makeConfig() {
  const onEvent = vi.fn();
  return { configurable: { onEvent } };
}

// ============================================================
// resolveCompanyNode
// ============================================================
describe('resolveCompanyNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns error when query is empty', async () => {
    const state = makeState({ userInput: '' });
    const result = await resolveCompanyNode(state);
    expect(result.error).toBe('No company query provided');
  });

  it('resolves company using Gemini + Yahoo search', async () => {
    mockYahoo.searchCompany.mockResolvedValue([
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    ]);
    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify({
        name: 'Apple Inc.',
        ticker: 'AAPL',
        exchange: 'NASDAQ',
        market: 'US',
        yahooSymbol: 'AAPL',
      }),
    });

    const state = makeState({ userInput: 'Apple' });
    const result = await resolveCompanyNode(state);

    expect(result.error).toBeNull();
    expect(result.resolvedCompany).toBeDefined();
    expect(result.resolvedCompany?.ticker).toBe('AAPL');
    expect(result.resolvedCompany?.name).toBe('Apple Inc.');
  });

  it('falls back to first Yahoo result when Gemini returns invalid JSON', async () => {
    mockYahoo.searchCompany.mockResolvedValue([
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    ]);
    mockInvokeGemini.mockResolvedValue({ content: 'not valid json' });

    const state = makeState({ userInput: 'Apple' });
    const result = await resolveCompanyNode(state);

    expect(result.error).toBeNull();
    expect(result.resolvedCompany?.ticker).toBe('AAPL');
  });

  it('returns error when no candidates found and Gemini fails', async () => {
    mockYahoo.searchCompany.mockResolvedValue([]);
    mockInvokeGemini.mockResolvedValue({ content: 'no match' });

    const state = makeState({ userInput: 'XYZXYZ123' });
    const result = await resolveCompanyNode(state);

    expect(result.error).toContain('Could not resolve company');
  });

  it('emits progress events', async () => {
    mockYahoo.searchCompany.mockResolvedValue([]);
    mockInvokeGemini.mockResolvedValue({ content: 'error' });

    const config = makeConfig();
    const state = makeState({ userInput: 'XYZ' });
    await resolveCompanyNode(state, config);

    expect(config.configurable.onEvent).toHaveBeenCalled();
    const calls = config.configurable.onEvent.mock.calls;
    expect(calls[0][0].status).toBe('running');
    expect(calls[calls.length - 1][0].status).toBe('error');
  });
});

// ============================================================
// companyProfileNode
// ============================================================
describe('companyProfileNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present in state', async () => {
    const state = makeState({ error: 'previous error' });
    const result = await companyProfileNode(state);
    expect(result).toEqual({});
  });

  it('skips when resolvedCompany is null', async () => {
    const state = makeState({ resolvedCompany: null });
    const result = await companyProfileNode(state);
    expect(result).toEqual({});
  });

  it('fetches profile from FMP for US companies', async () => {
    mockFmp.getCompanyProfile.mockResolvedValue({ name: 'Apple Inc.', ticker: 'AAPL' });
    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await companyProfileNode(state);
    expect(result.profile?.name).toBe('Apple Inc.');
    expect(mockFmp.getCompanyProfile).toHaveBeenCalledWith('AAPL');
  });

  it('falls back to Yahoo when FMP returns null for US', async () => {
    mockFmp.getCompanyProfile.mockResolvedValue(null);
    mockYahoo.getCompanyProfile.mockResolvedValue({ name: 'Apple Inc.', ticker: 'AAPL' });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await companyProfileNode(state);
    expect(result.profile?.name).toBe('Apple Inc.');
    expect(mockYahoo.getCompanyProfile).toHaveBeenCalledWith('AAPL');
  });

  it('uses Yahoo directly for Indian companies', async () => {
    mockYahoo.getCompanyProfile.mockResolvedValue({ name: 'Reliance', ticker: 'RELIANCE' });

    const state = makeState({
      resolvedCompany: { name: 'Reliance', ticker: 'RELIANCE', exchange: 'NSE', market: 'INDIA', yahooSymbol: 'RELIANCE.NS' },
    });

    const result = await companyProfileNode(state);
    expect(mockYahoo.getCompanyProfile).toHaveBeenCalledWith('RELIANCE.NS');
    expect(mockFmp.getCompanyProfile).not.toHaveBeenCalled();
  });

  it('returns error when profile cannot be fetched', async () => {
    mockFmp.getCompanyProfile.mockResolvedValue(null);
    mockYahoo.getCompanyProfile.mockResolvedValue(null);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await companyProfileNode(state);
    expect(result.error).toContain('Could not fetch company profile');
  });
});

// ============================================================
// financialDataNode
// ============================================================
describe('financialDataNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await financialDataNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('fetches from FMP for US companies', async () => {
    mockFmp.getIncomeStatements.mockResolvedValue([{ date: '2024-01-01', revenue: 1e12 }]);
    mockFmp.getBalanceSheets.mockResolvedValue([{ date: '2024-01-01' }]);
    mockFmp.getCashFlows.mockResolvedValue([{ date: '2024-01-01' }]);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await financialDataNode(state);
    expect(result.financials).toBeDefined();
    expect(result.financials?.incomeStatements).toHaveLength(1);
  });

  it('falls back to Yahoo when FMP returns empty', async () => {
    mockFmp.getIncomeStatements.mockResolvedValue([]);
    mockYahoo.getIncomeStatements.mockResolvedValue([{ date: '2024-01-01', revenue: 500e9 }]);
    mockYahoo.getBalanceSheets.mockResolvedValue([]);
    mockYahoo.getCashFlows.mockResolvedValue([]);

    const state = makeState({
      resolvedCompany: { name: 'Reliance', ticker: 'RELIANCE', exchange: 'NSE', market: 'INDIA', yahooSymbol: 'RELIANCE.NS' },
    });

    const result = await financialDataNode(state);
    expect(result.financials).toBeDefined();
    expect(mockYahoo.getIncomeStatements).toHaveBeenCalled();
  });

  it('returns error when no financial statements available', async () => {
    mockFmp.getIncomeStatements.mockResolvedValue([]);
    mockYahoo.getIncomeStatements.mockResolvedValue([]);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await financialDataNode(state);
    expect(result.error).toContain('No financial statements available');
  });
});

// ============================================================
// marketDataNode
// ============================================================
describe('marketDataNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await marketDataNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('fetches metrics and prices from FMP for US', async () => {
    mockFmp.getKeyMetrics.mockResolvedValue({ peRatio: 28 });
    mockFmp.getHistoricalPrices.mockResolvedValue([{ date: '2025-01-01', close: 195 }]);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await marketDataNode(state);
    expect(result.metrics?.peRatio).toBe(28);
    expect(result.priceHistory).toHaveLength(1);
  });

  it('falls back to Yahoo when FMP fails', async () => {
    mockFmp.getKeyMetrics.mockResolvedValue(null);
    mockFmp.getHistoricalPrices.mockResolvedValue([]);
    mockYahoo.getKeyMetrics.mockResolvedValue({ peRatio: 22 });
    mockYahoo.getHistoricalPrices.mockResolvedValue([{ date: '2025-01-01', close: 2500 }]);

    const state = makeState({
      resolvedCompany: { name: 'Reliance', ticker: 'RELIANCE', exchange: 'NSE', market: 'INDIA', yahooSymbol: 'RELIANCE.NS' },
    });

    const result = await marketDataNode(state);
    expect(result.metrics?.peRatio).toBe(22);
    expect(mockYahoo.getKeyMetrics).toHaveBeenCalled();
  });

  it('returns error when metrics cannot be fetched', async () => {
    mockFmp.getKeyMetrics.mockResolvedValue(null);
    mockYahoo.getKeyMetrics.mockResolvedValue(null);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await marketDataNode(state);
    expect(result.error).toContain('Could not fetch key valuation metrics');
  });
});

// ============================================================
// webResearchNode
// ============================================================
describe('webResearchNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await webResearchNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('performs web search and sends to Gemini for analysis', async () => {
    mockSearchWeb.mockResolvedValue([
      { title: 'Apple Moat', url: 'https://example.com', content: 'Wide moat analysis...' },
    ]);
    mockInvokeGemini.mockResolvedValue({ content: 'Apple has a wide economic moat...' });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await webResearchNode(state);
    expect(result.webResearchData).toBe('Apple has a wide economic moat...');
    expect(mockSearchWeb).toHaveBeenCalledWith(
      expect.stringContaining('Apple'),
      'advanced'
    );
  });

  it('returns message when no search results found', async () => {
    mockSearchWeb.mockResolvedValue([]);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await webResearchNode(state);
    expect(result.webResearchData).toBe('No research data found.');
  });

  it('returns error when Gemini fails', async () => {
    mockSearchWeb.mockResolvedValue([{ title: 'Test', url: 'https://test.com', content: 'data' }]);
    mockInvokeGemini.mockRejectedValue(new Error('Gemini timeout'));

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await webResearchNode(state);
    expect(result.error).toContain('Error in web research');
  });
});

// ============================================================
// newsSentimentNode
// ============================================================
describe('newsSentimentNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await newsSentimentNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('performs news search and classifies sentiment', async () => {
    mockSearchWeb.mockResolvedValue([
      { title: 'Apple Stock Up', url: 'https://news.com', content: 'Apple shares rose...' },
    ]);
    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify({
        summary: 'Positive sentiment overall.',
        items: [
          {
            title: 'Apple Stock Up',
            source: 'Reuters',
            date: '2025-01-01',
            url: 'https://news.com',
            snippet: 'Apple shares rose',
            sentiment: 'POSITIVE',
          },
        ],
      }),
    });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await newsSentimentNode(state);
    expect(result.newsSummary).toBe('Positive sentiment overall.');
    expect(result.newsItems).toHaveLength(1);
    expect(result.newsItems?.[0].sentiment).toBe('POSITIVE');
  });

  it('returns empty items when no news found', async () => {
    mockSearchWeb.mockResolvedValue([]);

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await newsSentimentNode(state);
    expect(result.newsItems).toEqual([]);
    expect(result.newsSummary).toContain('No recent news');
  });

  it('handles invalid JSON from Gemini gracefully', async () => {
    mockSearchWeb.mockResolvedValue([
      { title: 'Test', url: 'https://test.com', content: 'data' },
    ]);
    mockInvokeGemini.mockResolvedValue({ content: 'not valid json at all' });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
    });

    const result = await newsSentimentNode(state);
    // Should not crash, returns defaults
    expect(result.newsItems).toEqual([]);
  });
});

// ============================================================
// analysisNode
// ============================================================
describe('analysisNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await analysisNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('skips when required state fields are missing', async () => {
    const result = await analysisNode(makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      profile: null,
    }));
    expect(result).toEqual({});
  });

  it('performs analysis and extracts INVEST verdict from structured JSON', async () => {
    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify({
        analysisText: 'Apple has strong fundamentals and a wide moat.',
        verdict: 'INVEST',
        confidenceScore: 85,
      }),
    });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      profile: { name: 'Apple Inc.', ticker: 'AAPL', exchange: 'NASDAQ', sector: 'Technology', industry: 'Consumer Electronics', description: '', marketCap: 3e12, currency: 'USD', country: 'US', website: 'apple.com', employees: 160000, ipoDate: '', image: '' },
      financials: {
        incomeStatements: [{ date: '2024-01-01', period: 'FY', revenue: 1e12, costOfRevenue: 6e11, grossProfit: 4e11, grossProfitRatio: 0.4, operatingExpenses: 1.5e11, operatingIncome: 2.5e11, operatingIncomeRatio: 0.25, ebitda: 3e11, ebitdaRatio: 0.3, netIncome: 2e11, netIncomeRatio: 0.2, eps: 12, sgaExpenses: 5e10, rdExpenses: 3e10 }],
        balanceSheets: [],
        cashFlows: [],
      },
      metrics: { peRatio: 28, forwardPE: 25, pbRatio: 40, pegRatio: 1.5, roe: 1.5, roce: 0.5, roa: 0.3, debtToEquity: 1.5, currentRatio: 1.2, dividendYield: 0.005, evToEbitda: 22, priceToSales: 8, beta: 1.2, fiftyTwoWeekHigh: 200, fiftyTwoWeekLow: 160, currentPrice: 195, targetPrice: 210 },
      webResearchData: 'Wide economic moat...',
      newsSummary: 'Positive sentiment...',
    });

    const result = await analysisNode(state, makeConfig());
    expect(result.analysisText).toBeDefined();
    expect(result.analysisText).toContain('Apple has strong fundamentals');
    expect(result.verdict).toBe('INVEST');
  });

  it('extracts PASS verdict from structured JSON', async () => {
    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify({
        analysisText: 'Tesla is overvalued at current multiples.',
        verdict: 'PASS',
        confidenceScore: 70,
      }),
    });

    const state = makeState({
      resolvedCompany: { name: 'Tesla', ticker: 'TSLA', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'TSLA' },
      profile: { name: 'Tesla', ticker: 'TSLA', exchange: 'NASDAQ', sector: 'Auto', industry: 'EV', description: '', marketCap: 800e9, currency: 'USD', country: 'US', website: '', employees: 0, ipoDate: '', image: '' },
      financials: { incomeStatements: [{ date: '2024', period: 'FY', revenue: 100e9, costOfRevenue: 70e9, grossProfit: 30e9, grossProfitRatio: 0.3, operatingExpenses: 10e9, operatingIncome: 20e9, operatingIncomeRatio: 0.2, ebitda: 25e9, ebitdaRatio: 0.25, netIncome: 15e9, netIncomeRatio: 0.15, eps: 4, sgaExpenses: 3e9, rdExpenses: 4e9 }], balanceSheets: [], cashFlows: [] },
      metrics: { peRatio: 50, forwardPE: 40, pbRatio: 15, pegRatio: 3, roe: 0.3, roce: null, roa: 0.1, debtToEquity: 0.5, currentRatio: 1.5, dividendYield: 0, evToEbitda: 35, priceToSales: 8, beta: 2, fiftyTwoWeekHigh: 300, fiftyTwoWeekLow: 150, currentPrice: 250, targetPrice: 200 },
      webResearchData: 'Narrow moat...',
      newsSummary: 'Mixed sentiment...',
    });

    const result = await analysisNode(state, makeConfig());
    expect(result.verdict).toBe('PASS');
  });

  it('extracts HOLD verdict from structured JSON', async () => {
    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify({
        analysisText: 'The company looks fairly valued. HOLD recommendation.',
        verdict: 'HOLD',
        confidenceScore: 50,
      }),
    });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      profile: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', sector: '', industry: '', description: '', marketCap: 3e12, currency: 'USD', country: 'US', website: '', employees: 0, ipoDate: '', image: '' },
      financials: { incomeStatements: [{ date: '2024', period: 'FY', revenue: 1e12, costOfRevenue: 6e11, grossProfit: 4e11, grossProfitRatio: 0.4, operatingExpenses: 1.5e11, operatingIncome: 2.5e11, operatingIncomeRatio: 0.25, ebitda: 3e11, ebitdaRatio: 0.3, netIncome: 2e11, netIncomeRatio: 0.2, eps: 12, sgaExpenses: 5e10, rdExpenses: 3e10 }], balanceSheets: [], cashFlows: [] },
      metrics: { peRatio: 28, forwardPE: 25, pbRatio: 40, pegRatio: 1.5, roe: 1.5, roce: null, roa: 0.3, debtToEquity: 1.5, currentRatio: 1.2, dividendYield: 0.005, evToEbitda: 22, priceToSales: 8, beta: 1.2, fiftyTwoWeekHigh: 200, fiftyTwoWeekLow: 160, currentPrice: 195, targetPrice: 210 },
      webResearchData: 'Moat...',
      newsSummary: 'News...',
    });

    const result = await analysisNode(state, makeConfig());
    expect(result.verdict).toBe('HOLD');
  });

  it('falls back to text-based verdict extraction when JSON parsing fails', async () => {
    mockInvokeGemini.mockResolvedValue({
      content: 'VERDICT: PASS. The company faces strong headwinds.',
    });

    const state = makeState({
      resolvedCompany: { name: 'Tesla', ticker: 'TSLA', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'TSLA' },
      profile: { name: 'Tesla', ticker: 'TSLA', exchange: 'NASDAQ', sector: 'Auto', industry: 'EV', description: '', marketCap: 800e9, currency: 'USD', country: 'US', website: '', employees: 0, ipoDate: '', image: '' },
      financials: { incomeStatements: [{ date: '2024', period: 'FY', revenue: 100e9, costOfRevenue: 70e9, grossProfit: 30e9, grossProfitRatio: 0.3, operatingExpenses: 10e9, operatingIncome: 20e9, operatingIncomeRatio: 0.2, ebitda: 25e9, ebitdaRatio: 0.25, netIncome: 15e9, netIncomeRatio: 0.15, eps: 4, sgaExpenses: 3e9, rdExpenses: 4e9 }], balanceSheets: [], cashFlows: [] },
      metrics: { peRatio: 50, forwardPE: 40, pbRatio: 15, pegRatio: 3, roe: 0.3, roce: null, roa: 0.1, debtToEquity: 0.5, currentRatio: 1.5, dividendYield: 0, evToEbitda: 35, priceToSales: 8, beta: 2, fiftyTwoWeekHigh: 300, fiftyTwoWeekLow: 150, currentPrice: 250, targetPrice: 200 },
      webResearchData: 'Narrow moat...',
      newsSummary: 'Mixed sentiment...',
    });

    const result = await analysisNode(state, makeConfig());
    expect(result.verdict).toBe('PASS');
  });

  it('returns null verdict when no pattern matches in fallback', async () => {
    mockInvokeGemini.mockResolvedValue({
      content: 'Some random analysis text without a clear verdict mention.',
    });

    const state = makeState({
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      profile: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', sector: 'Tech', industry: 'CE', description: '', marketCap: 3e12, currency: 'USD', country: 'US', website: '', employees: 0, ipoDate: '', image: '' },
      financials: { incomeStatements: [{ date: '2024', period: 'FY', revenue: 1e12, costOfRevenue: 6e11, grossProfit: 4e11, grossProfitRatio: 0.4, operatingExpenses: 1.5e11, operatingIncome: 2.5e11, operatingIncomeRatio: 0.25, ebitda: 3e11, ebitdaRatio: 0.3, netIncome: 2e11, netIncomeRatio: 0.2, eps: 12, sgaExpenses: 5e10, rdExpenses: 3e10 }], balanceSheets: [], cashFlows: [] },
      metrics: { peRatio: 28, forwardPE: 25, pbRatio: 40, pegRatio: 1.5, roe: 1.5, roce: null, roa: 0.3, debtToEquity: 1.5, currentRatio: 1.2, dividendYield: 0.005, evToEbitda: 22, priceToSales: 8, beta: 1.2, fiftyTwoWeekHigh: 200, fiftyTwoWeekLow: 160, currentPrice: 195, targetPrice: 210 },
      webResearchData: 'Moat...',
      newsSummary: 'News...',
    });

    const result = await analysisNode(state, makeConfig());
    expect(result.verdict).toBeNull();
  });
});

// ============================================================
// reportGenerationNode
// ============================================================
describe('reportGenerationNode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when error is present', async () => {
    const result = await reportGenerationNode(makeState({ error: 'err' }));
    expect(result).toEqual({});
  });

  it('skips when resolvedCompany or analysisText is missing', async () => {
    const result = await reportGenerationNode(makeState({
      resolvedCompany: null,
      analysisText: '',
    }));
    expect(result).toEqual({});
  });

  it('generates structured report from analysis text', async () => {
    const mockReport = {
      companyName: 'Apple',
      ticker: 'AAPL',
      verdict: 'INVEST',
      confidenceScore: 85,
      investmentThesis: 'Strong buy.',
      companyOverview: 'Apple Inc.',
      financialAnalysis: {
        revenueAnalysis: 'Growing.',
        profitabilityAnalysis: 'Strong.',
        valuationAnalysis: 'Fair.',
        debtAnalysis: 'Manageable.',
      },
      competitiveLandscape: 'Dominant.',
      moatAnalysis: 'Wide moat.',
      growthCatalysts: ['Services', 'AI'],
      riskFactors: [{ risk: 'Regulation', severity: 'MEDIUM' }],
      keyTakeaways: ['Strong brand'],
      newsSummary: 'Positive.',
      newsItems: [],
      sensitivityNotes: '',
      peerComparison: '',
      fairValueEstimate: '$220',
    };

    mockInvokeGemini.mockResolvedValue({
      content: JSON.stringify(mockReport),
    });

    const state = makeState({
      userInput: 'Apple',
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      analysisText: 'VERDICT: INVEST. Apple is strong.',
      profile: { exchange: 'NASDAQ', sector: 'Technology' } as any,
      newsItems: [],
    });

    const result = await reportGenerationNode(state, makeConfig());
    expect(result.report).toBeDefined();
    expect(result.report?.companyName).toBe('Apple');
    expect(result.report?.ticker).toBe('AAPL');
    expect(result.report?.exchange).toBe('NASDAQ');
    expect(result.report?.sector).toBe('Technology');
    expect(result.report?.verdict).toBe('INVEST');
  });

  it('retries up to 3 times on JSON parse failure', async () => {
    mockInvokeGemini
      .mockResolvedValueOnce({ content: 'invalid json 1' })
      .mockResolvedValueOnce({ content: 'invalid json 2' })
      .mockResolvedValueOnce({ content: 'invalid json 3' });

    const state = makeState({
      userInput: 'Apple',
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      analysisText: 'Some analysis',
    });

    const result = await reportGenerationNode(state);
    expect(result.error).toContain('Failed to format');
    expect(mockInvokeGemini).toHaveBeenCalledTimes(3);
  });

  it('succeeds on second attempt after first parse failure', async () => {
    const mockReport = {
      companyName: 'Apple',
      ticker: 'AAPL',
      verdict: 'INVEST',
      confidenceScore: 80,
      investmentThesis: 'Strong.',
      companyOverview: '',
      financialAnalysis: { revenueAnalysis: '', profitabilityAnalysis: '', valuationAnalysis: '', debtAnalysis: '' },
      competitiveLandscape: '',
      moatAnalysis: '',
      growthCatalysts: [],
      riskFactors: [],
      keyTakeaways: [],
      newsSummary: '',
      newsItems: [],
      sensitivityNotes: '',
      peerComparison: '',
      fairValueEstimate: '',
    };

    mockInvokeGemini
      .mockResolvedValueOnce({ content: 'not json' })
      .mockResolvedValueOnce({ content: JSON.stringify(mockReport) });

    const state = makeState({
      userInput: 'Apple',
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      analysisText: 'Analysis text',
      profile: { exchange: 'NASDAQ', sector: 'Tech' } as any,
    });

    const result = await reportGenerationNode(state);
    expect(result.report).toBeDefined();
    expect(mockInvokeGemini).toHaveBeenCalledTimes(2);
  });

  it('returns error when all 3 retries fail', async () => {
    mockInvokeGemini.mockRejectedValue(new Error('Model crashed'));

    const state = makeState({
      userInput: 'Apple',
      resolvedCompany: { name: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ', market: 'US', yahooSymbol: 'AAPL' },
      analysisText: 'Analysis',
    });

    const result = await reportGenerationNode(state);
    expect(result.error).toContain('Failed to format');
  });
});

// ============================================================
// emitProgress helper (indirect)
// ============================================================
describe('emitProgress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls onEvent with correct step and status for each node', async () => {
    mockYahoo.searchCompany.mockResolvedValue([]);
    mockInvokeGemini.mockResolvedValue({ content: 'error' });

    const config = makeConfig();
    await resolveCompanyNode(makeState({ userInput: 'X' }), config);

    const events = config.configurable.onEvent.mock.calls.map((c: any) => c[0]);
    expect(events[0]).toMatchObject({ type: 'progress', step: 'resolve_company', status: 'running' });
    expect(events[events.length - 1]).toMatchObject({ type: 'progress', step: 'resolve_company', status: 'error' });
  });
});
