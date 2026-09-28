/**
 * Central Live Data Engine Service
 * Dainik Manyavar Single Source of Truth for Live Widgets & APIs
 */

import { liveCache } from './cache';
import { CricketLiveAdapter } from './adapters/cricketAdapter';
import { BullionLiveAdapter } from './adapters/bullionAdapter';
import { StockMarketLiveAdapter } from './adapters/marketAdapter';
import {
  NormalizedCricketMatch,
  BullionRatesResponse,
  StockMarketResponse,
  ProviderHealth,
} from './types';
import { getIndianMarketSession } from './marketHours';

type LiveEventCallback = (channel: string, data: any) => void;

class LiveDataService {
  private cricketAdapter = new CricketLiveAdapter();
  private bullionAdapter = new BullionLiveAdapter();
  private marketAdapter = new StockMarketLiveAdapter();

  private subscribers: Set<LiveEventCallback> = new Set();

  /**
   * Subscribe to SSE / real-time updates
   */
  subscribe(callback: LiveEventCallback): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private broadcast(channel: string, data: any) {
    for (const sub of this.subscribers) {
      try {
        sub(channel, data);
      } catch (_) {}
    }
  }

  /**
   * 1. CRICKET LIVE SCORES
   */
  async getCricketLive(force = false): Promise<{ data: NormalizedCricketMatch[]; meta: any }> {
    const cacheKey = 'live:cricket:all';
    const cached = liveCache.get<NormalizedCricketMatch[]>(cacheKey);

    if (!force && cached.data && cached.isFresh) {
      return {
        data: cached.data,
        meta: {
          fromCache: true,
          ageSeconds: cached.ageSeconds,
          status: cached.data[0]?.meta?.freshnessStatus || 'FRESH',
        },
      };
    }

    try {
      const matches = await this.cricketAdapter.fetchLatest();
      if (matches && matches.length > 0) {
        // Smart TTL: 30s if any match is LIVE, 300s if upcoming/completed
        const hasLive = matches.some((m) => m.matchStatus === 'LIVE');
        const ttl = hasLive ? 30 : 300;
        liveCache.set(cacheKey, matches, ttl);
        this.broadcast('cricket', matches);

        return {
          data: matches,
          meta: { fromCache: false, status: hasLive ? 'LIVE' : 'FRESH' },
        };
      }
    } catch (err) {
      console.error('[LiveDataService Cricket Error]:', err);
    }

    // Return last-known-good fallback
    const fallback = liveCache.getLastKnownGood<NormalizedCricketMatch[]>(cacheKey) || [];
    return {
      data: fallback,
      meta: {
        fromCache: true,
        isStale: true,
        status: fallback.length > 0 ? 'STALE' : 'UNAVAILABLE',
        staleReason: 'लाइव क्रिकेट डेटा अपडेट हो रहा है',
      },
    };
  }

  /**
   * 2. GOLD & SILVER RATES
   */
  async getBullionRates(force = false): Promise<BullionRatesResponse | null> {
    const cacheKey = 'live:bullion:rates';
    const cached = liveCache.get<BullionRatesResponse>(cacheKey);

    if (!force && cached.data && cached.isFresh) {
      return cached.data;
    }

    try {
      const rates = await this.bullionAdapter.fetchLatest();
      if (rates) {
        liveCache.set(cacheKey, rates, 300); // 5 min cache
        this.broadcast('bullion', rates);
        return rates;
      }
    } catch (err) {
      console.error('[LiveDataService Bullion Error]:', err);
    }

    // Return last-known-good
    return liveCache.getLastKnownGood<BullionRatesResponse>(cacheKey);
  }

  /**
   * 3. STOCK MARKET INDICES
   */
  async getMarketIndices(force = false): Promise<StockMarketResponse | null> {
    const cacheKey = 'live:market:indices';
    const cached = liveCache.get<StockMarketResponse>(cacheKey);
    const session = getIndianMarketSession();

    if (!force && cached.data && cached.isFresh) {
      return cached.data;
    }

    try {
      const data = await this.marketAdapter.fetchLatest();
      if (data) {
        // Smart TTL: 30s during active market trading, 300s when closed/weekend
        const ttl = session.isLiveTrading ? 30 : 300;
        liveCache.set(cacheKey, data, ttl);
        this.broadcast('market', data);
        return data;
      }
    } catch (err) {
      console.error('[LiveDataService Market Error]:', err);
    }

    return liveCache.getLastKnownGood<StockMarketResponse>(cacheKey);
  }

  /**
   * Health Check of all Adapters
   */
  async getAllHealth(): Promise<ProviderHealth[]> {
    return Promise.all([
      this.cricketAdapter.healthCheck(),
      this.bullionAdapter.healthCheck(),
      this.marketAdapter.healthCheck(),
    ]);
  }
}

// Global Singleton
const globalForLive = global as unknown as { liveDataService?: LiveDataService };
export const liveDataService = globalForLive.liveDataService || new LiveDataService();
if (process.env.NODE_ENV !== 'production') globalForLive.liveDataService = liveDataService;
