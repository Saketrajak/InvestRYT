import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';

// ============================================================
// Hoisted mocks — defined before vi.mock() factories run
// ============================================================
const {
  mockGraphInvoke,
  mockInvokeGemini,
  mockDetectMarket,
  mockToYahooSymbol,
  mockFmpGetCompanyProfile,
  mockFmpGetKeyMetrics,
  mockYahooGetCompanyProfile,
  mockYahooGetKeyMetrics,
} = vi.hoisted(() => {
  return {
    mockGraphInvoke: vi.fn(),
    mockInvokeGemini: vi.fn(),
    mockDetectMarket: vi.fn(),
    mockToYahooSymbol: vi.fn(),
    mockFmpGetCompanyProfile: vi.fn(),
    mockFmpGetKeyMetrics: vi.fn(),
    mockYahooGetCompanyProfile: vi.fn(),
    mockYahooGetKeyMetrics: vi.fn(),
  };
});

// ============================================================
// Mock all external dependencies
// ============================================================
vi.mock('../../agent/graph.js', () => ({
  graph: { invoke: mockGraphInvoke },
}));

vi.mock('../../services/aiService.js', () => ({
  invokeGemini: mockInvokeGemini,
}));

vi.mock('../../utils/marketDetector.js', () => ({
  detectMarket: mockDetectMarket,
  toYahooSymbol: mockToYahooSymbol,
}));

vi.mock('../../services/fmpService.js', () => ({
  getCompanyProfile: mockFmpGetCompanyProfile,
  getKeyMetrics: mockFmpGetKeyMetrics,
}));

vi.mock('../../services/yahooService.js', () => ({
  getCompanyProfile: mockYahooGetCompanyProfile,
  getKeyMetrics: mockYahooGetKeyMetrics,
}));

// ============================================================
// Import AFTER mocks are set up
// ============================================================
import researchRouter from '../../routes/research.js';

// ============================================================
// Test App Setup
// ============================================================
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', researchRouter);
  return app;
}

// Simple HTTP test helper (no external deps)
async function request(
  app: express.Express,
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; headers: any; body: any; text: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const addr = server.address() as any;
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: addr.port,
        path,
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      const req = http.request(options, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => (data += chunk));
        res.on('end', () => {
          server.close();
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            text: data,
          });
        });
      });

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

// ============================================================
// Tests
// ============================================================
describe('Research Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------
  // GET /api/research
  // --------------------------------------------------------
  describe('GET /api/research', () => {
    it('returns 400 when query parameter is missing', async () => {
      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Query parameter is required');
    });

    it('sets SSE headers on valid request', async () => {
      mockGraphInvoke.mockResolvedValue({
        error: null,
        report: { companyName: 'Test' },
        profile: { name: 'Test' },
        financials: { incomeStatements: [] },
        metrics: { peRatio: 25 },
        priceHistory: [],
      });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research?query=AAPL');

      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.headers['cache-control']).toBe('no-cache');
      expect(res.headers['connection']).toBe('keep-alive');
    });

    it('streams complete event with all data on success', async () => {
      const mockReport = { companyName: 'Apple', ticker: 'AAPL', verdict: 'INVEST' };
      const mockProfile = { name: 'Apple Inc.', ticker: 'AAPL' };
      const mockFinancials = { incomeStatements: [{ revenue: 1e12 }] };
      const mockMetrics = { peRatio: 28, currentPrice: 195 };

      mockGraphInvoke.mockResolvedValue({
        error: null,
        report: mockReport,
        profile: mockProfile,
        financials: mockFinancials,
        metrics: mockMetrics,
        priceHistory: [{ date: '2025-01-01', close: 195 }],
      });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research?query=Apple');

      expect(res.status).toBe(200);
      // Parse SSE data
      const dataLines = res.text.split('\n').filter((l: string) => l.startsWith('data:'));
      expect(dataLines.length).toBeGreaterThan(0);

      const lastEvent = JSON.parse(dataLines[dataLines.length - 1].replace('data: ', ''));
      expect(lastEvent.type).toBe('complete');
      expect(lastEvent.report).toEqual(mockReport);
      expect(lastEvent.profile).toEqual(mockProfile);
      expect(lastEvent.financials).toEqual(mockFinancials);
      expect(lastEvent.metrics).toEqual(mockMetrics);
      expect(lastEvent.priceHistory).toEqual([{ date: '2025-01-01', close: 195 }]);
    });

    it('streams error event when graph returns error', async () => {
      mockGraphInvoke.mockResolvedValue({
        error: 'Company not found',
        report: null,
        profile: null,
        financials: null,
        metrics: null,
        priceHistory: [],
      });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research?query=UNKNOWN');

      const dataLines = res.text.split('\n').filter((l: string) => l.startsWith('data:'));
      const lastEvent = JSON.parse(dataLines[dataLines.length - 1].replace('data: ', ''));
      expect(lastEvent.type).toBe('error');
      expect(lastEvent.message).toBe('Company not found');
    });

    it('streams error when report/profile/metrics are missing', async () => {
      mockGraphInvoke.mockResolvedValue({
        error: null,
        report: null,
        profile: { name: 'Apple' },
        financials: null,
        metrics: null,
        priceHistory: [],
      });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research?query=Apple');

      const dataLines = res.text.split('\n').filter((l: string) => l.startsWith('data:'));
      const lastEvent = JSON.parse(dataLines[dataLines.length - 1].replace('data: ', ''));
      expect(lastEvent.type).toBe('error');
      expect(lastEvent.message).toContain('missing');
    });

    it('streams error event when graph throws', async () => {
      mockGraphInvoke.mockRejectedValue(new Error('Gemini API down'));

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/research?query=AAPL');

      const dataLines = res.text.split('\n').filter((l: string) => l.startsWith('data:'));
      const lastEvent = JSON.parse(dataLines[dataLines.length - 1].replace('data: ', ''));
      expect(lastEvent.type).toBe('error');
      expect(lastEvent.message).toBe('Gemini API down');
    });
  });

  // --------------------------------------------------------
  // POST /api/chat
  // --------------------------------------------------------
  describe('POST /api/chat', () => {
    it('returns 400 when message is missing', async () => {
      const app = createTestApp();
      const res = await request(app, 'POST', '/api/chat', { companyName: 'Apple' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Message parameter is required');
    });

    it('returns AI reply on success with default persona', async () => {
      mockInvokeGemini.mockResolvedValue({
        content: 'Apple is a strong buy with a P/E of 28.',
      });

      const app = createTestApp();
      const res = await request(app, 'POST', '/api/chat', {
        companyName: 'Apple Inc.',
        ticker: 'AAPL',
        message: 'What is the valuation?',
        context: { profile: {}, financials: {}, metrics: {} },
      });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBe('Apple is a strong buy with a P/E of 28.');
      expect(mockInvokeGemini).toHaveBeenCalledWith(expect.any(Array), { temperature: 0.3 });
    });

    it('uses growth persona when specified', async () => {
      mockInvokeGemini.mockResolvedValue({ content: 'Growth looks strong.' });

      const app = createTestApp();
      await request(app, 'POST', '/api/chat', {
        companyName: 'Tesla',
        ticker: 'TSLA',
        message: 'Growth outlook?',
        persona: 'growth',
        context: {},
      });

      // Verify the system message contains growth persona instruction
      const callArgs = mockInvokeGemini.mock.calls[0][0];
      const systemMsg = callArgs[0].lc_kwargs?.content || callArgs[0]?.content || '';
      expect(systemMsg).toContain('growth investing bias');
    });

    it('uses bear persona when specified', async () => {
      mockInvokeGemini.mockResolvedValue({ content: 'Risks are high.' });

      const app = createTestApp();
      await request(app, 'POST', '/api/chat', {
        companyName: 'Tesla',
        ticker: 'TSLA',
        message: 'What are the risks?',
        persona: 'bear',
        context: {},
      });

      const callArgs = mockInvokeGemini.mock.calls[0][0];
      const systemMsg = callArgs[0].lc_kwargs?.content || callArgs[0]?.content || '';
      expect(systemMsg).toContain('short-seller bias');
    });

    it('includes chat history in message list', async () => {
      mockInvokeGemini.mockResolvedValue({ content: 'Reply' });

      const app = createTestApp();
      await request(app, 'POST', '/api/chat', {
        companyName: 'Apple',
        ticker: 'AAPL',
        message: 'Follow up question',
        history: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
        ],
        context: {},
      });

      const callArgs = mockInvokeGemini.mock.calls[0][0];
      // Should have: system + history_user + history_assistant + new_user = 4 messages
      expect(callArgs.length).toBe(4);
    });

    it('returns 500 when model invocation fails', async () => {
      mockInvokeGemini.mockRejectedValue(new Error('API key invalid'));

      const app = createTestApp();
      const res = await request(app, 'POST', '/api/chat', {
        companyName: 'Apple',
        ticker: 'AAPL',
        message: 'Hello',
        context: {},
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('API key invalid');
    });
  });

  // --------------------------------------------------------
  // GET /api/peer
  // --------------------------------------------------------
  describe('GET /api/peer', () => {
    it('returns 400 when symbol is missing', async () => {
      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Symbol parameter is required');
    });

    it('returns peer data from FMP for US stocks', async () => {
      mockDetectMarket.mockReturnValue('US');
      mockToYahooSymbol.mockReturnValue('AAPL');
      mockFmpGetCompanyProfile.mockResolvedValue({ name: 'Apple Inc.' });
      mockFmpGetKeyMetrics.mockResolvedValue({ peRatio: 28, roe: 0.45 });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer?symbol=AAPL');

      expect(res.status).toBe(200);
      expect(res.body.symbol).toBe('AAPL');
      expect(res.body.name).toBe('Apple Inc.');
      expect(res.body.metrics.peRatio).toBe(28);
    });

    it('falls back to Yahoo when FMP fails for US stock', async () => {
      mockDetectMarket.mockReturnValue('US');
      mockToYahooSymbol.mockReturnValue('AAPL');
      mockFmpGetCompanyProfile.mockResolvedValue(null);
      mockFmpGetKeyMetrics.mockResolvedValue(null);
      mockYahooGetCompanyProfile.mockResolvedValue({ name: 'Apple Inc.' });
      mockYahooGetKeyMetrics.mockResolvedValue({ peRatio: 28 });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer?symbol=AAPL');

      expect(res.status).toBe(200);
      expect(mockYahooGetCompanyProfile).toHaveBeenCalled();
    });

    it('uses Yahoo directly for Indian stocks', async () => {
      mockDetectMarket.mockReturnValue('INDIA');
      mockToYahooSymbol.mockReturnValue('RELIANCE.NS');
      mockYahooGetCompanyProfile.mockResolvedValue({ name: 'Reliance Industries' });
      mockYahooGetKeyMetrics.mockResolvedValue({ peRatio: 22 });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer?symbol=RELIANCE');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Reliance Industries');
      expect(mockFmpGetCompanyProfile).not.toHaveBeenCalled();
    });

    it('returns 404 when symbol cannot be resolved', async () => {
      mockDetectMarket.mockReturnValue('US');
      mockToYahooSymbol.mockReturnValue('FAKE');
      mockFmpGetCompanyProfile.mockResolvedValue(null);
      mockFmpGetKeyMetrics.mockResolvedValue(null);
      mockYahooGetCompanyProfile.mockResolvedValue(null);
      mockYahooGetKeyMetrics.mockResolvedValue(null);

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer?symbol=FAKE');

      expect(res.status).toBe(404);
      expect(res.body.error).toContain('could not be resolved');
    });

    it('returns 500 on unexpected error', async () => {
      mockDetectMarket.mockImplementation(() => {
        throw new Error('Internal error');
      });

      const app = createTestApp();
      const res = await request(app, 'GET', '/api/peer?symbol=AAPL');

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal error');
    });
  });
});
