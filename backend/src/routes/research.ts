// ============================================================
// Investryt AI — Research API Route (SSE)
// ============================================================

import { Router } from 'express';
import { graph } from '../agent/graph.js';
import type { SSEEvent } from '../types/index.js';

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

export default router;
