// ============================================================
// Investryt AI — Research API Route (SSE)
// ============================================================

import { Router } from 'express';
import { graph } from '../agent/graph.js';
import type { SSEEvent } from '../types/index.js';
import { getGeminiModel } from '../services/aiService.js';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { detectMarket, toYahooSymbol } from '../utils/marketDetector.js';
import * as yahooService from '../services/yahooService.js';
import * as fmpService from '../services/fmpService.js';

const router = Router();

router.get('/research', async (req, res) => {
  const query = req.query.query as string;
  if (!query) {
    res.status(400).json({ error: 'Query parameter is required' });
    return;
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Helper to send events
  const sendEvent = (event: SSEEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  // Callback to stream progress from nodes
  const onEvent = (event: SSEEvent) => {
    sendEvent(event);
  };

  try {
    console.log(`[ResearchRoute] Starting research for query: "${query}"`);

    const finalState = await graph.invoke(
      { userInput: query },
      { configurable: { onEvent } }
    );

    if (finalState.error) {
      sendEvent({
        type: 'error',
        message: finalState.error,
      });
    } else if (finalState.report && finalState.profile && finalState.financials && finalState.metrics) {
      // Completed successfully
      sendEvent({
        type: 'complete',
        report: finalState.report,
        profile: finalState.profile,
        financials: finalState.financials,
        metrics: finalState.metrics,
        priceHistory: finalState.priceHistory || [],
      });
    } else {
      sendEvent({
        type: 'error',
        message: 'Research finished but profile, financials or metrics were missing.',
      });
    }
  } catch (err: any) {
    console.error(`[ResearchRoute] Error in research pipeline for "${query}":`, err);
    sendEvent({
      type: 'error',
      message: err.message || 'Internal Server Error during research pipeline execution',
    });
  } finally {
    res.end();
  }
});

// ============================================================
// POST /api/chat — Chat Follow-Up handler
// ============================================================
router.post('/chat', async (req, res) => {
  const { companyName, ticker, history, message, context, persona } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message parameter is required' });
    return;
  }

  try {
    console.log(`[ChatRoute] Processing chat message for ${companyName} (${ticker}) with persona: ${persona || 'value'}`);

    // Build persona-specific instructions
    let personaInstruction = '';
    if (persona === 'growth') {
      personaInstruction = `You must answer with an aggressive growth investing bias. Focus heavily on market expansion potential, scaling vectors, technological moats, and forward catalyst events. Look past high trailing multiples if the growth trajectory justifies it.`;
    } else if (persona === 'bear') {
      personaInstruction = `You must answer with a critical short-seller bias. Focus heavily on negative catalysts, potential accounting flags, rising debt, sector headwinds, overvaluation, and key risk threats. Highlight where the consensus bull thesis is wrong.`;
    } else {
      // Default: value
      personaInstruction = `You must answer with a conservative value investing bias. Focus heavily on valuation margins, cash flows, balance sheet safety, and warning signs of overpricing. Cite P/E, P/B, and debt metrics.`;
    }

    // 1. Construct System Message with Financial Context
    const contextPrompt = `You are Investryt AI, an elite equity analyst and investment research assistant.
You are helping the user analyze the stock: ${companyName} (${ticker}).

Here is the financial context loaded for ${companyName}:
- Company Profile: ${context ? JSON.stringify(context.profile || {}) : 'N/A'}
- Key Metrics: ${context ? JSON.stringify(context.metrics || {}) : 'N/A'}
- Income Statements (past 5 years): ${context ? JSON.stringify(context.financials?.incomeStatements || []) : 'N/A'}
- Balance Sheets (past 5 years): ${context ? JSON.stringify(context.financials?.balanceSheets || []) : 'N/A'}
- Cash Flow Statements (past 5 years): ${context ? JSON.stringify(context.financials?.cashFlows || []) : 'N/A'}

Instructions:
1. Use this data to answer the user's questions accurately, professionally, and context-aware. 
2. If the user asks about revenue drop, balance sheet leverage, WACC, valuation multiples, or risk vectors, perform calculations or cross-reference the financial sheets.
3. Provide clear, institutional-grade explanations with specific numbers, trends, and financial logic. 
4. Keep answers concise, highly readable, and professional. 
5. Do not make up any numbers. If the data is not in the context, state that it is not available.

Persona Directive:
${personaInstruction}`;

    const systemMessage = new SystemMessage(contextPrompt);

    // 2. Map history to LangChain messages
    const messagesList: any[] = [systemMessage];
    
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          messagesList.push(new HumanMessage(msg.content));
        } else if (msg.role === 'assistant') {
          messagesList.push(new AIMessage(msg.content));
        }
      }
    }

    // Add the new message
    messagesList.push(new HumanMessage(message));

    // 3. Call model
    const model = getGeminiModel({ temperature: 0.3 });
    const response = await model.invoke(messagesList);

    const reply = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    res.json({ reply: reply.trim() });
  } catch (err: any) {
    console.error(`[ChatRoute] Error in chat handler for "${ticker}":`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error during chat response generation' });
  }
});

// ============================================================
// GET /api/peer — Dynamic Peer Multiples Lookup
// ============================================================
router.get('/peer', async (req, res) => {
  const symbol = req.query.symbol as string;
  if (!symbol) {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    const market = detectMarket(symbol);
    const yahooSymbol = toYahooSymbol(symbol, market);
    console.log(`[PeerRoute] Fetching metrics for peer "${symbol}" (detected market: ${market}, yahoo: ${yahooSymbol})`);

    let profile: any = null;
    let metrics: any = null;

    if (market === 'US') {
      // Try FMP first
      try {
        const fmpProfile = await fmpService.getCompanyProfile(symbol);
        if (fmpProfile) {
          profile = fmpProfile;
          metrics = await fmpService.getKeyMetrics(symbol);
        }
      } catch (err) {
        console.error(`[PeerRoute] FMP fetch failed for ${symbol}, trying Yahoo:`, err);
      }
    }

    // Fallback or primary for INDIA/GLOBAL
    if (!profile || !metrics) {
      profile = await yahooService.getCompanyProfile(yahooSymbol);
      metrics = await yahooService.getKeyMetrics(yahooSymbol);
    }

    if (!profile || !metrics) {
      res.status(404).json({ error: `Symbol ${symbol} could not be resolved or metrics not found.` });
      return;
    }

    res.json({
      symbol: symbol.toUpperCase(),
      name: profile.name,
      metrics: metrics,
    });
  } catch (err: any) {
    console.error(`[PeerRoute] Error in peer multiples lookup:`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error fetching peer multiples' });
  }
});

export default router;
