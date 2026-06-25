// ============================================================
// Investryt AI — Agent Graph State
// ============================================================

import { Annotation } from '@langchain/langgraph';
import type {
  ResolvedCompany,
  CompanyProfile,
  FinancialData,
  KeyMetrics,
  StockPriceEntry,
  NewsItem,
  ResearchReport
} from '../types/index.js';

export const AgentState = Annotation.Root({
  userInput: Annotation<string>(),
  resolvedCompany: Annotation<ResolvedCompany | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  profile: Annotation<CompanyProfile | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  financials: Annotation<FinancialData | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  metrics: Annotation<KeyMetrics | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  priceHistory: Annotation<StockPriceEntry[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  webResearchData: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  analysisText: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  newsItems: Annotation<NewsItem[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  newsSummary: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  verdict: Annotation<'INVEST' | 'PASS' | 'HOLD' | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  report: Annotation<ResearchReport | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
  error: Annotation<string | null>({
    reducer: (x, y) => y ?? x,
    default: () => null,
  }),
});

export type AgentStateType = typeof AgentState.State;
