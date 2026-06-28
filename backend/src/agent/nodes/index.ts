// ============================================================
// Investryt AI — Agent Nodes
// ============================================================

import { invokeGemini } from '../../services/aiService.js';
import * as fmpService from '../../services/fmpService.js';
import * as yahooService from '../../services/yahooService.js';
import { searchWeb } from '../../services/tavilyService.js';
import { detectMarket } from '../../utils/marketDetector.js';
import type { AgentStateType } from '../state.js';
import type { SSEEvent, ResolvedCompany, CompanyProfile, FinancialData, KeyMetrics, StockPriceEntry, NewsItem } from '../../types/index.js';
import {
  COMPANY_RESOLVER_PROMPT,
  MOAT_AND_COMPETITION_PROMPT,
  NEWS_SENTIMENT_PROMPT,
  RESEARCH_ANALYSIS_PROMPT,
  REPORT_GENERATION_PROMPT,
} from '../prompts/index.js';
import { HumanMessage } from '@langchain/core/messages';
import { validateReport, formatValidationErrors } from '../../utils/validateReport.js';

// ---- Helper to stream progress events ----
function emitProgress(config: any, step: string, status: 'pending' | 'running' | 'completed' | 'error', message: string, data?: any) {
  const onEvent = config?.configurable?.onEvent;
  if (onEvent) {
    onEvent({
      type: 'progress',
      step,
      status,
      message,
      data,
    } as SSEEvent);
  }
}

// ============================================================
// 1. Resolve Company Node
// ============================================================
export async function resolveCompanyNode(state: AgentStateType, config?: any) {
  emitProgress(config, 'resolve_company', 'running', 'Searching and resolving company details...');

  const query = state.userInput;
  if (!query) {
    emitProgress(config, 'resolve_company', 'error', 'No company query provided');
    return { error: 'No company query provided' };
  }

  try {
    // Step A: Search Yahoo Finance to get potential candidate matches
    const searchResults = await yahooService.searchCompany(query);
    
    // Step B: Use Gemini to choose the correct candidate or resolve from query
    const formattedPrompt = COMPANY_RESOLVER_PROMPT
      .replace('{query}', query) + (searchResults.length > 0 ? `\nCandidates from search:\n${JSON.stringify(searchResults, null, 2)}` : '');

    const response = await invokeGemini([new HumanMessage(formattedPrompt)], { temperature: 0.1, responseMimeType: 'application/json' });
    const textContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    // Parse response
    let resolved: ResolvedCompany | null = null;
    try {
      const parsed = JSON.parse(textContent.trim());
      if (parsed && parsed.ticker) {
        resolved = {
          name: parsed.name,
          ticker: parsed.ticker,
          exchange: parsed.exchange,
          market: parsed.market,
          yahooSymbol: parsed.yahooSymbol,
        };
      }
    } catch (e) {
      console.error('[Nodes] Failed to parse company resolver JSON response:', textContent, e);
    }

    // Fallback if AI output is invalid or null
    if (!resolved && searchResults.length > 0) {
      const first = searchResults[0];
      const detected = detectMarket(first.symbol);
      resolved = {
        name: first.name,
        ticker: first.symbol.split('.')[0],
        exchange: first.exchange,
        market: detected,
        yahooSymbol: first.symbol,
      };
    }

    if (!resolved) {
      const msg = `Could not resolve company for query: "${query}"`;
      emitProgress(config, 'resolve_company', 'error', msg);
      return { error: msg };
    }

    emitProgress(config, 'resolve_company', 'completed', `Resolved to: ${resolved.name} (${resolved.yahooSymbol})`, resolved);
    return { resolvedCompany: resolved, error: null };
  } catch (err: any) {
    const msg = `Error resolving company: ${err.message || err}`;
    emitProgress(config, 'resolve_company', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 2. Company Profile Node
// ============================================================
export async function companyProfileNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  if (!company) return {};

  emitProgress(config, 'company_profile', 'running', `Fetching profile for ${company.name}...`);

  try {
    let profile: CompanyProfile | null = null;

    if (company.market === 'US') {
      profile = await fmpService.getCompanyProfile(company.ticker);
    }

    // Fallback to Yahoo if US profile is empty, or if it's India/Global
    if (!profile) {
      profile = await yahooService.getCompanyProfile(company.yahooSymbol);
    }

    if (!profile) {
      const msg = `Could not fetch company profile for ${company.name}`;
      emitProgress(config, 'company_profile', 'error', msg);
      return { error: msg };
    }

    emitProgress(config, 'company_profile', 'completed', `Profile retrieved for ${profile.name}`, profile);
    return { profile };
  } catch (err: any) {
    const msg = `Error fetching company profile: ${err.message || err}`;
    emitProgress(config, 'company_profile', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 3. Financial Data Node
// ============================================================
export async function financialDataNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  if (!company) return {};

  emitProgress(config, 'financial_data', 'running', `Retrieving 5-year financial statements for ${company.name}...`);

  try {
    let financials: FinancialData | null = null;

    if (company.market === 'US') {
      const [income, balance, cashflow] = await Promise.all([
        fmpService.getIncomeStatements(company.ticker),
        fmpService.getBalanceSheets(company.ticker),
        fmpService.getCashFlows(company.ticker),
      ]);

      if (income.length > 0) {
        financials = {
          incomeStatements: income,
          balanceSheets: balance,
          cashFlows: cashflow,
        };
      }
    }

    // Fallback to Yahoo for India/Global, or if FMP failed
    if (!financials) {
      const [income, balance, cashflow] = await Promise.all([
        yahooService.getIncomeStatements(company.yahooSymbol),
        yahooService.getBalanceSheets(company.yahooSymbol),
        yahooService.getCashFlows(company.yahooSymbol),
      ]);

      financials = {
        incomeStatements: income,
        balanceSheets: balance,
        cashFlows: cashflow,
      };
    }

    if (!financials || financials.incomeStatements.length === 0) {
      const msg = `No financial statements available for ${company.name}`;
      emitProgress(config, 'financial_data', 'error', msg);
      return { error: msg };
    }

    emitProgress(config, 'financial_data', 'completed', `Financial statements retrieved (${financials.incomeStatements.length} years)`, financials);
    return { financials };
  } catch (err: any) {
    const msg = `Error retrieving financial statements: ${err.message || err}`;
    emitProgress(config, 'financial_data', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 4. Market Data Node
// ============================================================
export async function marketDataNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  if (!company) return {};

  emitProgress(config, 'market_data', 'running', `Fetching valuation metrics and 1-year price history for ${company.name}...`);

  try {
    let metrics: KeyMetrics | null = null;
    let priceHistory: StockPriceEntry[] = [];

    if (company.market === 'US') {
      [metrics, priceHistory] = await Promise.all([
        fmpService.getKeyMetrics(company.ticker),
        fmpService.getHistoricalPrices(company.ticker),
      ]);
    }

    // Always fetch Yahoo metrics as well — they fill in fields FMP doesn't provide
    // (e.g. targetPrice, forwardPE, dividendYield) and serve as fallback
    let yMetrics: KeyMetrics | null = null;
    let yPrice: StockPriceEntry[] = [];
    try { yMetrics = await yahooService.getKeyMetrics(company.yahooSymbol); } catch {}
    try { yPrice = await yahooService.getHistoricalPrices(company.yahooSymbol); } catch {}

    // Merge FMP + Yahoo metrics: prefer FMP for primary fields, but use Yahoo to
    // fill in nulls for fields FMP doesn't provide
    if (yMetrics && metrics) {
      metrics = {
        ...metrics,
        // Use Yahoo values for fields FMP often misses
        forwardPE: metrics.forwardPE ?? yMetrics.forwardPE,
        targetPrice: metrics.targetPrice ?? yMetrics.targetPrice,
        pegRatio: metrics.pegRatio ?? yMetrics.pegRatio,
        dividendYield: metrics.dividendYield ?? yMetrics.dividendYield,
        currentPrice: metrics.currentPrice ?? yMetrics.currentPrice,
        beta: metrics.beta ?? yMetrics.beta,
      };
    } else if (yMetrics && !metrics) {
      metrics = yMetrics;
    }

    if (priceHistory.length === 0 && yPrice.length > 0) {
      priceHistory = yPrice;
    }

    if (!metrics) {
      const msg = `Could not fetch key valuation metrics for ${company.name}`;
      emitProgress(config, 'market_data', 'error', msg);
      return { error: msg };
    }

    emitProgress(config, 'market_data', 'completed', `Key metrics and price history (${priceHistory.length} data points) retrieved`, { metrics, priceHistoryCount: priceHistory.length });
    return { metrics, priceHistory };
  } catch (err: any) {
    const msg = `Error fetching market data: ${err.message || err}`;
    emitProgress(config, 'market_data', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 5. Web Research Node (Moat and Competition)
// ============================================================
export async function webResearchNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  if (!company) return {};

  emitProgress(config, 'web_research', 'running', `Searching web for moat, market share, and competitors of ${company.name}...`);

  try {
    const query = `${company.name} market share competitors economic moat analysis`;
    const searchResults = await searchWeb(query, 'advanced');

    if (searchResults.length === 0) {
      return { webResearchData: 'No research data found.' };
    }

    const formattedSearch = searchResults.map((r, i) => `[Result ${i+1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n`).join('\n');

    const formattedPrompt = MOAT_AND_COMPETITION_PROMPT
      .replace('{companyName}', company.name)
      .replace('{ticker}', company.ticker)
      .replace('{searchResults}', formattedSearch);

    const response = await invokeGemini([new HumanMessage(formattedPrompt)], { temperature: 0.2 });
    const analysisText = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    emitProgress(config, 'web_research', 'completed', 'Completed moat and competition analysis', analysisText);
    return { webResearchData: analysisText };
  } catch (err: any) {
    const msg = `Error in web research: ${err.message || err}`;
    emitProgress(config, 'web_research', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 6. News Sentiment Node
// ============================================================
export async function newsSentimentNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  if (!company) return {};

  emitProgress(config, 'news_sentiment', 'running', `Analyzing recent news headlines and sentiment for ${company.name}...`);

  try {
    const query = `${company.name} stock news headlines recent 2026`;
    const searchResults = await searchWeb(query, 'basic');

    if (searchResults.length === 0) {
      return { newsSummary: 'No recent news articles found.', newsItems: [] };
    }

    const formattedNews = searchResults.map((r, i) => `[Article ${i+1}] Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}\n`).join('\n');

    const formattedPrompt = NEWS_SENTIMENT_PROMPT
      .replace('{companyName}', company.name)
      .replace('{ticker}', company.ticker)
      .replace('{newsResults}', formattedNews);

    const response = await invokeGemini([new HumanMessage(formattedPrompt)], { temperature: 0.1, responseMimeType: 'application/json' });
    const textContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    let summary = 'No summary available.';
    let items: NewsItem[] = [];

    try {
      const parsed = JSON.parse(textContent.trim());
      summary = parsed.summary || summary;
      items = (parsed.items || []).map((item: any) => ({
        title: item.title || '',
        source: item.source || '',
        date: item.date || new Date().toLocaleDateString(),
        url: item.url || '',
        snippet: item.snippet || '',
        sentiment: item.sentiment || 'NEUTRAL',
      }));
    } catch (e) {
      console.error('[Nodes] Failed to parse news sentiment JSON:', textContent, e);
    }

    emitProgress(config, 'news_sentiment', 'completed', `Completed news sentiment analysis (${items.length} articles)`, { summary, itemsCount: items.length });
    return { newsSummary: summary, newsItems: items };
  } catch (err: any) {
    const msg = `Error in news sentiment analysis: ${err.message || err}`;
    emitProgress(config, 'news_sentiment', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 7. Core Valuation and Financial Analysis Node
// ============================================================
export async function analysisNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  const profile = state.profile;
  const financials = state.financials;
  const metrics = state.metrics;
  const webResearch = state.webResearchData;
  const newsSummary = state.newsSummary;

  if (!company || !profile || !financials || !metrics) return {};

  emitProgress(config, 'analysis', 'running', `Conducting institutional equity research and financial analysis for ${company.name}...`);

  try {
    const formattedIncome = JSON.stringify(financials.incomeStatements.slice(0, 5), null, 2);
    const formattedBalance = JSON.stringify(financials.balanceSheets.slice(0, 5), null, 2);
    const formattedCashflow = JSON.stringify(financials.cashFlows.slice(0, 5), null, 2);

    const formattedPrompt = RESEARCH_ANALYSIS_PROMPT
      .replace('{companyName}', company.name)
      .replace('{ticker}', company.ticker)
      .replace('{exchange}', profile.exchange)
      .replace('{sector}', profile.sector)
      .replace('{industry}', profile.industry)
      .replace('{description}', profile.description)
      .replace('{marketCap}', profile.marketCap ? profile.marketCap.toLocaleString() : 'N/A')
      .replace('{country}', profile.country)
      .replace('{website}', profile.website)
      .replace('{currentPrice}', metrics.currentPrice ? String(metrics.currentPrice) : 'N/A')
      .replace('{targetPrice}', metrics.targetPrice ? String(metrics.targetPrice) : 'N/A')
      .replace('{fiftyTwoWeekLow}', metrics.fiftyTwoWeekLow ? String(metrics.fiftyTwoWeekLow) : 'N/A')
      .replace('{fiftyTwoWeekHigh}', metrics.fiftyTwoWeekHigh ? String(metrics.fiftyTwoWeekHigh) : 'N/A')
      .replace('{beta}', metrics.beta ? String(metrics.beta) : 'N/A')
      .replace('{peRatio}', metrics.peRatio ? String(metrics.peRatio) : 'N/A')
      .replace('{forwardPE}', metrics.forwardPE ? String(metrics.forwardPE) : 'N/A')
      .replace('{pbRatio}', metrics.pbRatio ? String(metrics.pbRatio) : 'N/A')
      .replace('{pegRatio}', metrics.pegRatio ? String(metrics.pegRatio) : 'N/A')
      .replace('{roe}', metrics.roe ? String(metrics.roe) : 'N/A')
      .replace('{roa}', metrics.roa ? String(metrics.roa) : 'N/A')
      .replace('{dividendYield}', metrics.dividendYield ? String(metrics.dividendYield) : 'N/A')
      .replace('{debtToEquity}', metrics.debtToEquity ? String(metrics.debtToEquity) : 'N/A')
      .replace('{currentRatio}', metrics.currentRatio ? String(metrics.currentRatio) : 'N/A')
      .replace('{evToEbitda}', metrics.evToEbitda ? String(metrics.evToEbitda) : 'N/A')
      .replace('{priceToSales}', metrics.priceToSales ? String(metrics.priceToSales) : 'N/A')
      .replace('{currency}', profile.currency)
      .replace('{incomeStatements}', formattedIncome)
      .replace('{balanceSheets}', formattedBalance)
      .replace('{cashFlows}', formattedCashflow)
      .replace('{webResearchData}', webResearch)
      .replace('{newsSummary}', newsSummary);

    const response = await invokeGemini([new HumanMessage(formattedPrompt)], { temperature: 0.3, responseMimeType: 'application/json' });
    const rawContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    // Parse structured JSON output with fallback
    let analysisText = rawContent;
    let verdict: 'INVEST' | 'PASS' | 'HOLD' | null = null;
    let confidenceScore: number | null = null;

    try {
      const parsed = JSON.parse(rawContent.trim());
      analysisText = parsed.analysisText || rawContent;
      
      // Validate verdict is one of the allowed values
      const v = parsed.verdict?.toUpperCase?.();
      if (v === 'INVEST' || v === 'PASS' || v === 'HOLD') {
        verdict = v;
      }
      
      // Validate confidenceScore is a number in 0-100
      if (typeof parsed.confidenceScore === 'number' && parsed.confidenceScore >= 0 && parsed.confidenceScore <= 100) {
        confidenceScore = parsed.confidenceScore;
      }
    } catch (e) {
      console.error('[Nodes] Failed to parse analysis JSON response, falling back to text extraction:', e);
      // Fallback: try text-based extraction
      if (rawContent.includes('VERDICT: INVEST') || rawContent.includes('Decision: INVEST') || rawContent.toLowerCase().includes('verdict is invest')) {
        verdict = 'INVEST';
      } else if (rawContent.includes('VERDICT: PASS') || rawContent.includes('Decision: PASS') || rawContent.toLowerCase().includes('verdict is pass')) {
        verdict = 'PASS';
      } else if (rawContent.includes('VERDICT: HOLD') || rawContent.includes('Decision: HOLD') || rawContent.toLowerCase().includes('verdict is hold')) {
        verdict = 'HOLD';
      }
    }

    emitProgress(config, 'analysis', 'completed', `Completed core research analysis | Verdict: ${verdict || 'N/A'}`, { verdict, confidenceScore });
    return { analysisText, verdict };
  } catch (err: any) {
    const msg = `Error in core analysis: ${err.message || err}`;
    emitProgress(config, 'analysis', 'error', msg);
    return { error: msg };
  }
}

// ============================================================
// 8. Report Generation Node
// ============================================================
export async function reportGenerationNode(state: AgentStateType, config?: any) {
  if (state.error) return {};
  const company = state.resolvedCompany;
  const analysisText = state.analysisText;
  const profile = state.profile;
  const metrics = state.metrics;
  const financials = state.financials;

  if (!company || !analysisText) return {};

  emitProgress(config, 'report_generation', 'running', `Formatting investment report into premium structured format...`);

  try {
    // Build raw data context for cross-referencing to prevent AI hallucination
    const latestIncome = financials?.incomeStatements?.[0];
    const latestCashFlow = financials?.cashFlows?.[0];
    const rawDataContext = JSON.stringify({
      sector: profile?.sector || '',
      industry: profile?.industry || '',
      currentPrice: metrics?.currentPrice,
      targetPrice: metrics?.targetPrice,
      peRatio: metrics?.peRatio,
      forwardPE: metrics?.forwardPE,
      pbRatio: metrics?.pbRatio,
      pegRatio: metrics?.pegRatio,
      roe: metrics?.roe,
      roa: metrics?.roa,
      debtToEquity: metrics?.debtToEquity,
      currentRatio: metrics?.currentRatio,
      evToEbitda: metrics?.evToEbitda,
      priceToSales: metrics?.priceToSales,
      beta: metrics?.beta,
      fiftyTwoWeekLow: metrics?.fiftyTwoWeekLow,
      fiftyTwoWeekHigh: metrics?.fiftyTwoWeekHigh,
      dividendYield: metrics?.dividendYield,
      marketCap: profile?.marketCap,
      currency: profile?.currency,
      latestRevenue: latestIncome?.revenue,
      latestNetIncome: latestIncome?.netIncome,
      latestFreeCashFlow: latestCashFlow?.freeCashFlow,
    });

    const formattedPrompt = REPORT_GENERATION_PROMPT
      .replace('{companyName}', company.name)
      .replace('{ticker}', company.ticker)
      .replace('{sector}', profile?.sector || '')
      .replace('{industry}', profile?.industry || '')
      .replace('{currentPrice}', metrics?.currentPrice?.toString() || 'N/A')
      .replace('{targetPrice}', metrics?.targetPrice?.toString() || 'N/A')
      .replace('{peRatio}', metrics?.peRatio?.toString() || 'N/A')
      .replace('{forwardPE}', metrics?.forwardPE?.toString() || 'N/A')
      .replace('{pbRatio}', metrics?.pbRatio?.toString() || 'N/A')
      .replace('{pegRatio}', metrics?.pegRatio?.toString() || 'N/A')
      .replace('{roe}', metrics?.roe?.toString() || 'N/A')
      .replace('{roa}', metrics?.roa?.toString() || 'N/A')
      .replace('{debtToEquity}', metrics?.debtToEquity?.toString() || 'N/A')
      .replace('{currentRatio}', metrics?.currentRatio?.toString() || 'N/A')
      .replace('{evToEbitda}', metrics?.evToEbitda?.toString() || 'N/A')
      .replace('{priceToSales}', metrics?.priceToSales?.toString() || 'N/A')
      .replace('{beta}', metrics?.beta?.toString() || 'N/A')
      .replace('{fiftyTwoWeekLow}', metrics?.fiftyTwoWeekLow?.toString() || 'N/A')
      .replace('{fiftyTwoWeekHigh}', metrics?.fiftyTwoWeekHigh?.toString() || 'N/A')
      .replace('{dividendYield}', metrics?.dividendYield?.toString() || 'N/A')
      .replace('{marketCap}', profile?.marketCap?.toLocaleString() || 'N/A')
      .replace('{currency}', profile?.currency || 'USD')
      .replace('{latestRevenue}', latestIncome?.revenue?.toLocaleString() || 'N/A')
      .replace('{latestNetIncome}', latestIncome?.netIncome?.toLocaleString() || 'N/A')
      .replace('{latestFreeCashFlow}', latestCashFlow?.freeCashFlow?.toLocaleString() || 'N/A');

    let report = null;
    let textContent = '';

    for (let i = 0; i < 3; i++) {
      try {
        const response = await invokeGemini([
          new HumanMessage(`Core analysis raw content:\n${analysisText}\n\nUser raw search query was: ${state.userInput}\n\nRAW FINANCIAL DATA (use this to verify all numbers in the report):\n${rawDataContext}\n\nNow, compile the final report. Cross-reference every claim against the raw data above. Do not fabricate or alter any numbers.`),
          new HumanMessage(formattedPrompt)
        ], { temperature: 0.1, responseMimeType: 'application/json' });

        textContent = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        let cleanText = textContent.trim();
        const startIndex = cleanText.indexOf('{');
        const endIndex = cleanText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          cleanText = cleanText.substring(startIndex, endIndex + 1);
        }
        
        // Remove unescaped control characters (like raw newlines) inside JSON strings
        cleanText = cleanText.replace(/[\u0000-\u001F]+/g, " ");

        const parsed = JSON.parse(cleanText);
        // Populate standard items that should mirror inputs
        parsed.companyName = company.name;
        parsed.ticker = company.ticker;
        parsed.exchange = state.profile?.exchange || company.exchange;
        parsed.sector = state.profile?.sector || parsed.sector || '';
        parsed.newsItems = state.newsItems; // carry news items through
        
        // Validate the report against actual financial data (skip if data is missing)
        const validationErrors = state.profile && state.financials && state.metrics
          ? validateReport(parsed, state.profile, state.financials, state.metrics)
          : [];
        if (validationErrors.some(e => e.severity === 'error')) {
          console.warn(`[Nodes] Report validation failed (Attempt ${i + 1}):\n${formatValidationErrors(validationErrors)}`);
          // If we have errors and it's not the last attempt, retry
          if (i < 2) {
            continue;
          }
        }
        if (validationErrors.length > 0) {
          console.warn(`[Nodes] Report validation warnings:\n${formatValidationErrors(validationErrors)}`);
        }
        
        report = parsed;
        break; // Successfully parsed!
      } catch (e) {
        console.error(`[Nodes] Failed to parse final report JSON (Attempt ${i + 1}):`, textContent, e);
        if (i === 2) {
          break; // Stop after 3 attempts
        }
      }
    }

    if (!report) {
      const msg = 'Failed to format the equity research report into structured JSON.';
      emitProgress(config, 'report_generation', 'error', msg);
      return { error: msg };
    }

    emitProgress(config, 'report_generation', 'completed', 'Investryt AI Investment Report generated successfully!', report);
    return { report };
  } catch (err: any) {
    const msg = `Error generating report: ${err.message || err}`;
    emitProgress(config, 'report_generation', 'error', msg);
    return { error: msg };
  }
}
