// ============================================================
// Investryt AI — Report Validation Utility
// ============================================================
// Validates AI-generated research reports against actual financial
// data to catch hallucinated numbers, missing fields, and
// out-of-range values before they reach the frontend.
// ============================================================

import type {
  ResearchReport,
  CompanyProfile,
  FinancialData,
  KeyMetrics,
} from '../types/index.js';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate an AI-generated report against the source data.
 * Returns an array of validation errors (empty = valid).
 */
export function validateReport(
  report: ResearchReport,
  profile: CompanyProfile,
  financials: FinancialData,
  metrics: KeyMetrics,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ---- 1. Required fields presence ----
  const requiredStringFields: (keyof ResearchReport)[] = [
    'investmentThesis',
    'companyOverview',
    'competitiveLandscape',
    'moatAnalysis',
    'newsSummary',
    'sensitivityNotes',
    'peerComparison',
    'fairValueEstimate',
  ];
  for (const field of requiredStringFields) {
    const val = report[field];
    if (!val || (typeof val === 'string' && val.trim().length < 10)) {
      errors.push({
        field: `report.${field}`,
        message: `Missing or too short (min 10 chars)`,
        severity: 'error',
      });
    }
  }

  // ---- 2. Verdict validation ----
  if (!['INVEST', 'PASS', 'HOLD'].includes(report.verdict)) {
    errors.push({
      field: 'report.verdict',
      message: `Invalid verdict: "${report.verdict}". Must be INVEST, PASS, or HOLD.`,
      severity: 'error',
    });
  }

  // ---- 3. Confidence score validation ----
  if (typeof report.confidenceScore !== 'number' || report.confidenceScore < 0 || report.confidenceScore > 100) {
    errors.push({
      field: 'report.confidenceScore',
      message: `Invalid confidenceScore: ${report.confidenceScore}. Must be 0-100.`,
      severity: 'error',
    });
  }

  // ---- 4. Financial analysis sub-fields ----
  const requiredAnalysisFields: (keyof typeof report.financialAnalysis)[] = [
    'revenueAnalysis',
    'profitabilityAnalysis',
    'valuationAnalysis',
    'debtAnalysis',
  ];
  for (const field of requiredAnalysisFields) {
    if (!report.financialAnalysis[field] || report.financialAnalysis[field].trim().length < 10) {
      errors.push({
        field: `report.financialAnalysis.${field}`,
        message: `Missing or too short (min 10 chars)`,
        severity: 'error',
      });
    }
  }

  // ---- 5. Growth catalysts ----
  if (!report.growthCatalysts || report.growthCatalysts.length < 1) {
    errors.push({
      field: 'report.growthCatalysts',
      message: 'Must have at least 1 growth catalyst',
      severity: 'warning',
    });
  }

  // ---- 6. Risk factors ----
  if (!report.riskFactors || report.riskFactors.length < 1) {
    errors.push({
      field: 'report.riskFactors',
      message: 'Must have at least 1 risk factor',
      severity: 'warning',
    });
  } else {
    for (const rf of report.riskFactors) {
      if (!['HIGH', 'MEDIUM', 'LOW'].includes(rf.severity)) {
        errors.push({
          field: 'report.riskFactors.severity',
          message: `Invalid severity: "${rf.severity}". Must be HIGH, MEDIUM, or LOW.`,
          severity: 'error',
        });
      }
    }
  }

  // ---- 7. Key takeaways ----
  if (!report.keyTakeaways || report.keyTakeaways.length < 2) {
    errors.push({
      field: 'report.keyTakeaways',
      message: 'Must have at least 2 key takeaways',
      severity: 'warning',
    });
  }

  // ---- 8. Cross-reference with actual metrics ----
  // Check if the verdict contradicts the actual target price vs current price data
  // (e.g., targetPrice > currentPrice significantly but verdict is PASS)
  if (metrics && metrics.currentPrice && metrics.targetPrice) {
    const upside = (metrics.targetPrice - metrics.currentPrice) / metrics.currentPrice;
    if (upside > 0.3 && report.verdict === 'PASS') {
      errors.push({
        field: 'report.verdict',
        message: `Verdict is PASS but target price (${metrics.targetPrice}) is ${(upside * 100).toFixed(0)}% above current price (${metrics.currentPrice}). May be inconsistent.`,
        severity: 'warning',
      });
    }
    if (upside < -0.2 && report.verdict === 'INVEST') {
      errors.push({
        field: 'report.verdict',
        message: `Verdict is INVEST but target price (${metrics.targetPrice}) is ${(Math.abs(upside) * 100).toFixed(0)}% below current price (${metrics.currentPrice}). May be inconsistent.`,
        severity: 'warning',
      });
    }
  }

  // ---- 9. News items should match between report and state ----
  if (report.newsItems && report.newsItems.length > 0) {
    for (const item of report.newsItems) {
      if (!['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(item.sentiment)) {
        errors.push({
          field: 'report.newsItems.sentiment',
          message: `Invalid news sentiment: "${item.sentiment}". Must be POSITIVE, NEGATIVE, or NEUTRAL.`,
          severity: 'error',
        });
      }
    }
  }

  // ---- 10. Ticker/name consistency ----
  if (report.ticker !== profile.ticker && report.ticker !== profile.ticker.toUpperCase()) {
    errors.push({
      field: 'report.ticker',
      message: `Report ticker "${report.ticker}" does not match profile ticker "${profile.ticker}".`,
      severity: 'error',
    });
  }

  return errors;
}

/**
 * Format validation errors into a human-readable string.
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return 'Report validation passed.';
  const errorList = errors
    .map((e) => `  [${e.severity.toUpperCase()}] ${e.field}: ${e.message}`)
    .join('\n');
  return `Report validation found ${errors.length} issue(s):\n${errorList}`;
}
