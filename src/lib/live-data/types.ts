/**
 * Live Data Engine Type Definitions
 * Dainik Manyavar Production Architecture
 */

export type FreshnessStatus = 'LIVE' | 'FRESH' | 'DELAYED' | 'STALE' | 'UNAVAILABLE';

export type MarketSessionState = 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'HOLIDAY' | 'WEEKEND';

export type ProviderHealthStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNCONFIGURED';

export interface BaseLiveDataMeta {
  providerName: string;
  providerUpdatedAt?: string;
  serverReceivedAt: string;
  lastValidatedAt: string;
  freshnessStatus: FreshnessStatus;
  isStale: boolean;
  staleReason?: string;
  isDelayed?: boolean;
  delayMinutes?: number;
}

// ----------------------------------------------------
// Cricket Live Normalized Types
// ----------------------------------------------------
export interface NormalizedCricketMatch {
  id: string;
  matchTitle: string;
  tournament: string;
  matchType?: string; // T20, ODI, TEST
  teamA: {
    name: string;
    code: string;
    score?: string;
    overs?: string;
    wickets?: number;
  };
  teamB: {
    name: string;
    code: string;
    score?: string;
    overs?: string;
    wickets?: number;
  };
  matchStatus: 'LIVE' | 'UPCOMING' | 'COMPLETED' | 'INNINGS_BREAK' | 'STUMPS' | 'DELAYED' | 'ABANDONED';
  statusText: string;
  resultText?: string;
  venue?: string;
  currentInnings?: number;
  runRate?: string;
  requiredRunRate?: string;
  target?: number;
  currentBatsmen?: Array<{ name: string; runs: number; balls: number }>;
  currentBowler?: { name: string; overs: string; maidens: number; runs: number; wickets: number };
  meta: BaseLiveDataMeta;
}

// ----------------------------------------------------
// Bullion / Gold & Silver Normalized Types
// ----------------------------------------------------
export interface NormalizedBullionItem {
  commodity: 'gold' | 'silver';
  purity: '24K' | '22K' | '18K' | '999';
  unit: '10g' | '1g' | '1kg';
  price: number;
  currency: 'INR';
  change: number;
  changePercent: number;
  city?: string;
  priceType: 'RETAIL' | 'SPOT' | 'MCX_FUTURES';
  meta: BaseLiveDataMeta;
}

export interface BullionRatesResponse {
  gold24K: NormalizedBullionItem;
  gold22K: NormalizedBullionItem;
  gold18K?: NormalizedBullionItem;
  silver: NormalizedBullionItem;
  cityRates: Array<{
    city: string;
    gold24K: number;
    gold22K: number;
    silver: number;
    change: number;
  }>;
  meta: BaseLiveDataMeta;
}

// ----------------------------------------------------
// Stock Market Normalized Types
// ----------------------------------------------------
export interface NormalizedMarketIndex {
  symbol: string; // NIFTY50, SENSEX, BANKNIFTY, USDINR
  name: string;
  value: number;
  change: number;
  changePercent: number;
  isUp: boolean;
  marketStatus: MarketSessionState;
  marketStatusText: string;
  high?: number;
  low?: number;
  previousClose?: number;
  meta: BaseLiveDataMeta;
}

export interface StockMarketResponse {
  indices: {
    sensex: NormalizedMarketIndex;
    nifty50: NormalizedMarketIndex;
    bankNifty?: NormalizedMarketIndex;
    usdInr?: NormalizedMarketIndex;
  };
  marketSession: {
    state: MarketSessionState;
    labelHindi: string;
    nextSessionTime?: string;
  };
  meta: BaseLiveDataMeta;
}

// ----------------------------------------------------
// Health & Diagnostic Types
// ----------------------------------------------------
export interface ProviderHealth {
  providerId: string;
  category: 'cricket' | 'bullion' | 'market';
  name: string;
  status: ProviderHealthStatus;
  lastSuccessfulSync?: string;
  lastFailedSync?: string;
  latencyMs?: number;
  errorCount: number;
  lastErrorMessage?: string;
  isConfigured: boolean;
}
