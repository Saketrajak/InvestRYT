import { describe, it, expect } from 'vitest';
import {
  detectMarket,
  toYahooSymbol,
  formatMarketCap,
  formatNumber,
  formatPercent,
  formatRatio,
} from '../../utils/marketDetector.js';

// ============================================================
// detectMarket
// ============================================================
describe('detectMarket', () => {
  describe('Indian stock suffixes', () => {
    it('detects .NS suffix as INDIA', () => {
      expect(detectMarket('RELIANCE.NS')).toBe('INDIA');
    });

    it('detects .BO suffix as INDIA', () => {
      expect(detectMarket('TCS.BO')).toBe('INDIA');
    });

    it('detects .NSE suffix as INDIA', () => {
      expect(detectMarket('INFY.NSE')).toBe('INDIA');
    });

    it('detects .BSE suffix as INDIA', () => {
      expect(detectMarket('WIPRO.BSE')).toBe('INDIA');
    });

    it('is case-insensitive for suffixes', () => {
      expect(detectMarket('reliance.ns')).toBe('INDIA');
      expect(detectMarket('TCS.BO'.toLowerCase())).toBe('INDIA');
    });
  });

  describe('Indian company name hints', () => {
    const indianCompanies = [
      'Reliance Industries',
      'Tata Consultancy Services',
      'Infosys Limited',
      'Wipro',
      'HDFC Bank',
      'ICICI Bank',
      'Kotak Mahindra',
      'Bajaj Finance',
      'Bharti Airtel',
      'Maruti Suzuki',
      'Asian Paints',
      'Adani Enterprises',
      'Mahindra & Mahindra',
      'SBI',
      'Axis Bank',
      'IndusInd Bank',
      'Titan Company',
      'Nestle India',
      'Britannia Industries',
      'Cipla',
      'Sun Pharma',
      'Dr Reddys Laboratories',
      'DMart',
      'Zomato',
      'Paytm',
      'Larsen & Toubro',
      'Ultratech Cement',
      'HCL Technologies',
      'Tech Mahindra',
      'Power Grid Corporation',
      'NTPC',
      'ONGC',
      'Coal India',
      'GAIL',
      'BPCL',
      'Hindalco',
      'JSW Steel',
    ];

    indianCompanies.forEach((company) => {
      it(`detects "${company}" as INDIA`, () => {
        expect(detectMarket(company)).toBe('INDIA');
      });
    });
  });

  describe('Indian exchange names', () => {
    const indianExchanges = ['NSE', 'BSE', 'NSEI', 'BSEI'];

    indianExchanges.forEach((exchange) => {
      it(`detects "${exchange}" exchange as INDIA`, () => {
        expect(detectMarket(exchange)).toBe('INDIA');
        expect(detectMarket(`AAPL on ${exchange}`)).toBe('INDIA');
      });
    });
  });

  describe('US exchange names', () => {
    const usExchanges = ['NYSE', 'NASDAQ', 'AMEX', 'NYSEARCA', 'NYSEMKT', 'BATS', 'OTC'];

    usExchanges.forEach((exchange) => {
      it(`detects "${exchange}" exchange as US`, () => {
        expect(detectMarket(exchange)).toBe('US');
        expect(detectMarket(`AAPL on ${exchange}`)).toBe('US');
      });
    });
  });

  describe('default behavior', () => {
    it('defaults to US for plain ticker symbols', () => {
      expect(detectMarket('AAPL')).toBe('US');
      expect(detectMarket('MSFT')).toBe('US');
      expect(detectMarket('GOOGL')).toBe('US');
    });

    it('defaults to US for unknown company names', () => {
      expect(detectMarket('Some Random Company')).toBe('US');
    });
  });

  describe('edge cases', () => {
    it('handles empty string', () => {
      expect(detectMarket('')).toBe('US');
    });

    it('handles whitespace-only input', () => {
      expect(detectMarket('   ')).toBe('US');
    });

    it('handles input with leading/trailing spaces', () => {
      expect(detectMarket('  RELIANCE.NS  ')).toBe('INDIA');
    });
  });
});

// ============================================================
// toYahooSymbol
// ============================================================
describe('toYahooSymbol', () => {
  it('appends .NS for Indian market', () => {
    expect(toYahooSymbol('RELIANCE', 'INDIA')).toBe('RELIANCE.NS');
    expect(toYahooSymbol('TCS', 'INDIA')).toBe('TCS.NS');
  });

  it('returns plain ticker for US market', () => {
    expect(toYahooSymbol('AAPL', 'US')).toBe('AAPL');
    expect(toYahooSymbol('MSFT', 'US')).toBe('MSFT');
  });

  it('returns plain ticker for GLOBAL market', () => {
    expect(toYahooSymbol('005930', 'GLOBAL')).toBe('005930');
  });

  it('preserves existing suffix', () => {
    expect(toYahooSymbol('RELIANCE.NS', 'INDIA')).toBe('RELIANCE.NS');
    expect(toYahooSymbol('TCS.BO', 'INDIA')).toBe('TCS.BO');
    expect(toYahooSymbol('AAPL.O', 'US')).toBe('AAPL.O');
  });

  it('handles lowercase input by normalizing to uppercase', () => {
    expect(toYahooSymbol('reliance', 'INDIA')).toBe('RELIANCE.NS');
    expect(toYahooSymbol('aapl', 'US')).toBe('AAPL');
  });

  it('trims whitespace', () => {
    expect(toYahooSymbol('  AAPL  ', 'US')).toBe('AAPL');
    expect(toYahooSymbol('  RELIANCE  ', 'INDIA')).toBe('RELIANCE.NS');
  });
});

// ============================================================
// formatMarketCap
// ============================================================
describe('formatMarketCap', () => {
  it('returns N/A for null/undefined/zero', () => {
    expect(formatMarketCap(null)).toBe('N/A');
    expect(formatMarketCap(0)).toBe('N/A');
  });

  it('formats trillions', () => {
    expect(formatMarketCap(3e12)).toBe('$3.00T');
    expect(formatMarketCap(2.5e12)).toBe('$2.50T');
    expect(formatMarketCap(1.23e12)).toBe('$1.23T');
  });

  it('formats billions', () => {
    expect(formatMarketCap(1e9)).toBe('$1.00B');
    expect(formatMarketCap(500e9)).toBe('$500.00B');
    expect(formatMarketCap(2.5e9)).toBe('$2.50B');
  });

  it('formats millions', () => {
    expect(formatMarketCap(1e6)).toBe('$1.00M');
    expect(formatMarketCap(150e6)).toBe('$150.00M');
  });

  it('formats small values with locale string', () => {
    expect(formatMarketCap(500)).toBe('$500');
    // toLocaleString() is platform-dependent, just verify it contains digits and no suffix
    const result = formatMarketCap(999999);
    expect(result).toMatch(/^\$[\d,]+$/);
  });
});

// ============================================================
// formatNumber
// ============================================================
describe('formatNumber', () => {
  it('returns N/A for null/undefined', () => {
    expect(formatNumber(null)).toBe('N/A');
    expect(formatNumber(undefined)).toBe('N/A');
  });

  it('formats trillions', () => {
    expect(formatNumber(1e12)).toBe('1.0T');
    expect(formatNumber(2.5e12)).toBe('2.5T');
  });

  it('formats billions', () => {
    expect(formatNumber(1e9)).toBe('1.0B');
    expect(formatNumber(500e9)).toBe('500.0B');
  });

  it('formats millions', () => {
    expect(formatNumber(1e6)).toBe('1.0M');
    expect(formatNumber(150e6)).toBe('150.0M');
  });

  it('formats small numbers with locale string', () => {
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(12345)).toBe('12,345');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1e9)).toBe('-1.0B');
    expect(formatNumber(-5e6)).toBe('-5.0M');
  });
});

// ============================================================
// formatPercent
// ============================================================
describe('formatPercent', () => {
  it('returns N/A for null/undefined', () => {
    expect(formatPercent(null)).toBe('N/A');
    expect(formatPercent(undefined)).toBe('N/A');
  });

  it('converts decimal to percentage', () => {
    expect(formatPercent(0.15)).toBe('15.00%');
    expect(formatPercent(0.5)).toBe('50.00%');
    expect(formatPercent(1)).toBe('100.00%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('handles negative percentages', () => {
    expect(formatPercent(-0.05)).toBe('-5.00%');
  });
});

// ============================================================
// formatRatio
// ============================================================
describe('formatRatio', () => {
  it('returns N/A for null/undefined', () => {
    expect(formatRatio(null)).toBe('N/A');
    expect(formatRatio(undefined)).toBe('N/A');
  });

  it('formats ratio with x suffix', () => {
    expect(formatRatio(25.5)).toBe('25.50x');
    expect(formatRatio(1)).toBe('1.00x');
    expect(formatRatio(0.5)).toBe('0.50x');
  });

  it('handles zero', () => {
    expect(formatRatio(0)).toBe('0.00x');
  });

  it('handles large ratios', () => {
    expect(formatRatio(1000)).toBe('1000.00x');
  });
});
