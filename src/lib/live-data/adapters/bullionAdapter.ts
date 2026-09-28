/**
 * Bullion (Gold & Silver) Rates Provider Adapter
 * Normalizes rates for 24K, 22K, 18K Gold and Silver with unit and currency precision.
 */

import { BaseLiveAdapter } from './base';
import { BullionRatesResponse, ProviderHealth } from '../types';
import { db } from '@/lib/db';

export class BullionLiveAdapter implements BaseLiveAdapter<BullionRatesResponse> {
  providerId = 'bullion-adapter-v1';
  category = 'bullion' as const;
  name = process.env.BULLION_PROVIDER || 'Dainik Manyavar Bullion Feed (IBJA/Market)';

  private errorCount = 0;
  private lastSuccessTime?: string;
  private lastFailTime?: string;
  private lastErrorMessage?: string;

  async fetchLatest(): Promise<BullionRatesResponse | null> {
    const apiUrl = process.env.BULLION_API_URL;
    const apiKey = process.env.BULLION_API_KEY;

    // 1. External Authorized API Provider
    if (apiUrl && apiKey) {
      try {
        const res = await fetch(`${apiUrl}/rates?currency=INR`, {
          headers: {
            'x-access-token': apiKey,
            Accept: 'application/json',
          },
          next: { revalidate: 300 }, // 5 min cache
        });

        if (!res.ok) {
          throw new Error(`Bullion provider HTTP error: ${res.status}`);
        }

        const raw = await res.json();
        const normalized = this.normalize(raw);
        const validation = this.validate(normalized);

        if (!validation.isValid) {
          throw new Error(`Bullion validation failed: ${validation.reason}`);
        }

        this.lastSuccessTime = new Date().toISOString();
        return normalized;
      } catch (err: any) {
        this.errorCount++;
        this.lastFailTime = new Date().toISOString();
        this.lastErrorMessage = err.message;
        console.error('[BullionLiveAdapter Error]:', err.message);
      }
    }

    // 2. Database Verified Snapshot Fallback
    try {
      const prices = await db.commodityPrice.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 10,
      });

      if (!prices || prices.length === 0) {
        return null;
      }

      const primary = prices.find((p) => p.city === 'वाराणसी') || prices[0];
      const now = new Date();
      const updatedDate = new Date(primary.updatedAt);
      const isToday = updatedDate.toDateString() === now.toDateString();
      const hoursAgo = Math.round((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));

      const meta = {
        providerName: apiUrl ? this.name : 'दैनिक मान्यवर सर्राफा डेस्क (IBJA Benchmark)',
        providerUpdatedAt: primary.updatedAt.toISOString(),
        serverReceivedAt: now.toISOString(),
        lastValidatedAt: now.toISOString(),
        freshnessStatus: isToday ? ('FRESH' as const) : ('STALE' as const),
        isStale: !isToday,
        staleReason: !isToday ? `अंतिम अपडेट ${hoursAgo} घंटे पहले हुआ था` : undefined,
      };

      const cityRates = prices.map((p) => ({
        city: p.city,
        gold24K: p.gold24K,
        gold22K: p.gold22K,
        silver: p.silver,
        change: p.goldChange || 0,
      }));

      return {
        gold24K: {
          commodity: 'gold',
          purity: '24K',
          unit: '10g',
          price: primary.gold24K,
          currency: 'INR',
          change: primary.goldChange || 0,
          changePercent: primary.gold24K > 0 ? Number(((primary.goldChange / primary.gold24K) * 100).toFixed(2)) : 0,
          city: primary.city,
          priceType: 'RETAIL',
          meta,
        },
        gold22K: {
          commodity: 'gold',
          purity: '22K',
          unit: '10g',
          price: primary.gold22K,
          currency: 'INR',
          change: Math.round((primary.goldChange || 0) * 0.916),
          changePercent: primary.gold22K > 0 ? Number(((primary.goldChange / primary.gold22K) * 100).toFixed(2)) : 0,
          city: primary.city,
          priceType: 'RETAIL',
          meta,
        },
        silver: {
          commodity: 'silver',
          purity: '999',
          unit: '1kg',
          price: primary.silver,
          currency: 'INR',
          change: primary.silverChange || 0,
          changePercent: primary.silver > 0 ? Number(((primary.silverChange / primary.silver) * 100).toFixed(2)) : 0,
          city: primary.city,
          priceType: 'RETAIL',
          meta,
        },
        cityRates,
        meta,
      };
    } catch (err: any) {
      this.errorCount++;
      return null;
    }
  }

  normalize(raw: any): BullionRatesResponse {
    const now = new Date().toISOString();
    const goldPrice = Number(raw.gold_24k || raw.price_gold || 75000);
    const silverPrice = Number(raw.silver || raw.price_silver || 88000);

    const meta = {
      providerName: this.name,
      providerUpdatedAt: raw.updated_at || now,
      serverReceivedAt: now,
      lastValidatedAt: now,
      freshnessStatus: 'LIVE' as const,
      isStale: false,
    };

    return {
      gold24K: {
        commodity: 'gold',
        purity: '24K',
        unit: '10g',
        price: goldPrice,
        currency: 'INR',
        change: Number(raw.change_gold || 0),
        changePercent: Number(raw.change_percent_gold || 0),
        priceType: 'RETAIL',
        meta,
      },
      gold22K: {
        commodity: 'gold',
        purity: '22K',
        unit: '10g',
        price: Math.round(goldPrice * 0.9167),
        currency: 'INR',
        change: Math.round(Number(raw.change_gold || 0) * 0.916),
        changePercent: Number(raw.change_percent_gold || 0),
        priceType: 'RETAIL',
        meta,
      },
      silver: {
        commodity: 'silver',
        purity: '999',
        unit: '1kg',
        price: silverPrice,
        currency: 'INR',
        change: Number(raw.change_silver || 0),
        changePercent: Number(raw.change_percent_silver || 0),
        priceType: 'RETAIL',
        meta,
      },
      cityRates: [],
      meta,
    };
  }

  validate(data: BullionRatesResponse): { isValid: boolean; reason?: string } {
    if (!data.gold24K || !data.silver) {
      return { isValid: false, reason: 'Missing 24K gold or silver prices' };
    }
    // Reject impossible prices (e.g. Gold under 10k or over 200k in INR per 10g)
    if (data.gold24K.price < 10000 || data.gold24K.price > 250000) {
      return { isValid: false, reason: `Unrealistic gold price: ${data.gold24K.price}` };
    }
    if (data.silver.price < 10000 || data.silver.price > 250000) {
      return { isValid: false, reason: `Unrealistic silver price: ${data.silver.price}` };
    }
    return { isValid: true };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const isConfigured = Boolean(process.env.BULLION_API_KEY && process.env.BULLION_API_URL);
    return {
      providerId: this.providerId,
      category: this.category,
      name: this.name,
      status: !isConfigured ? 'UNCONFIGURED' : this.errorCount > 3 ? 'DEGRADED' : 'HEALTHY',
      lastSuccessfulSync: this.lastSuccessTime,
      lastFailedSync: this.lastFailTime,
      errorCount: this.errorCount,
      lastErrorMessage: this.lastErrorMessage,
      isConfigured,
    };
  }
}
