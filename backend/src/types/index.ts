// ============================================================
// Investryt AI — Shared Type Definitions
// ============================================================

// ---- API Key Pool ----
export interface ApiKeyPool {
  keys: string[];
  currentIndex: number;
}

// ---- Market Detection ----
export type MarketType = 'US' | 'INDIA' | 'GLOBAL';

export interface ResolvedCompany {
  name: string;
  ticker: string;
  exchange: string;
  market: MarketType;
  yahooSymbol: string; // e.g., RELIANCE.NS, AAPL, 005930.KS
}

// ---- Company Profile ----
export interface CompanyProfile {
  name: string;
  ticker: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  marketCap: number | null;
  currency: string;
  country: string;
  website: string;
  employees: number | null;
  ipoDate: string;
  image: string;
}

// ---- Financial Statements ----
export interface IncomeStatementEntry {
  date: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  ebitda: number;
  ebitdaRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  sgaExpenses: number;
  rdExpenses: number;
}

export interface BalanceSheetEntry {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalDebt: number;
  cashAndEquivalents: number;
  currentAssets: number;
  currentLiabilities: number;
}

export interface CashFlowEntry {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number;
}

export interface FinancialData {
  incomeStatements: IncomeStatementEntry[];
  balanceSheets: BalanceSheetEntry[];
  cashFlows: CashFlowEntry[];
}

// ---- Key Metrics ----
export interface KeyMetrics {
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  pegRatio: number | null;
  roe: number | null;
  roce: number | null;
  roa: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  dividendYield: number | null;
  evToEbitda: number | null;
  priceToSales: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  currentPrice: number | null;
  targetPrice: number | null;
}

// ---- Stock Price History ----
export interface StockPriceEntry {
  date: string;     // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ---- News ----
export interface NewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  snippet: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

// ---- Agent State ----
export interface ResearchReport {
  companyName: string;
  ticker: string;
  exchange: string;
  sector: string;
  verdict: 'INVEST' | 'PASS' | 'HOLD';
  confidenceScore: number; // 0-100
  investmentThesis: string;
  companyOverview: string;
  financialAnalysis: {
    revenueAnalysis: string;
    profitabilityAnalysis: string;
    valuationAnalysis: string;
    debtAnalysis: string;
  };
  competitiveLandscape: string;
  moatAnalysis: string;
  growthCatalysts: string[];
  riskFactors: RiskFactor[];
  keyTakeaways: string[];
  newsSummary: string;
  newsItems: NewsItem[];
  sensitivityNotes: string;
  peerComparison: string;
  fairValueEstimate: string;
}

export interface RiskFactor {
  risk: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ---- SSE Progress Events ----
export type AgentStep =
  | 'resolve_company'
  | 'company_profile'
  | 'financial_data'
  | 'market_data'
  | 'web_research'
  | 'news_sentiment'
  | 'analysis'
  | 'deep_dive'
  | 'report_generation';

export type StepStatus = 'pending' | 'running' | 'completed' | 'error';

export interface ProgressEvent {
  type: 'progress';
  step: AgentStep;
  status: StepStatus;
  message: string;
  data?: any;
}

export interface CompleteEvent {
  type: 'complete';
  report: ResearchReport;
  profile: CompanyProfile;
  financials: FinancialData;
  metrics: KeyMetrics;
  priceHistory: StockPriceEntry[];
}

export interface ErrorEvent {
  type: 'error';
  message: string;
  step?: AgentStep;
}

export type SSEEvent = ProgressEvent | CompleteEvent | ErrorEvent;
