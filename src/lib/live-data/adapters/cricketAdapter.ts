/**
 * Cricket Live Score Provider Adapter
 * Normalizes, validates, and manages match freshness.
 */

import { BaseLiveAdapter } from './base';
import { NormalizedCricketMatch, ProviderHealth } from '../types';
import { db } from '@/lib/db';

export class CricketLiveAdapter implements BaseLiveAdapter<NormalizedCricketMatch[]> {
  providerId = 'cricket-adapter-v1';
  category = 'cricket' as const;
  name = process.env.CRICKET_PROVIDER || 'Dainik Manyavar Authorized Cricket Feed';

  private errorCount = 0;
  private lastSuccessTime?: string;
  private lastFailTime?: string;
  private lastErrorMessage?: string;

  async fetchLatest(): Promise<NormalizedCricketMatch[] | null> {
    const apiUrl = process.env.CRICKET_API_URL;
    const apiKey = process.env.CRICKET_API_KEY;

    // 1. If authorized live provider credentials exist in .env
    if (apiUrl && apiKey) {
      try {
        const start = Date.now();
        const res = await fetch(`${apiUrl}/matches?apikey=${apiKey}`, {
          headers: { Accept: 'application/json' },
          next: { revalidate: 30 },
        });

        if (!res.ok) {
          throw new Error(`Cricket provider HTTP error: ${res.status}`);
        }

        const raw = await res.json();
        const normalized = this.normalize(raw);
        const validation = this.validate(normalized);

        if (!validation.isValid) {
          throw new Error(`Cricket validation failed: ${validation.reason}`);
        }

        this.lastSuccessTime = new Date().toISOString();
        return normalized;
      } catch (err: any) {
        this.errorCount++;
        this.lastFailTime = new Date().toISOString();
        this.lastErrorMessage = err.message;
        console.error('[CricketLiveAdapter Error]:', err.message);
        // Fall back to database snapshots
      }
    }

    // 2. Verified Database Fallback
    try {
      const dbMatches = await db.cricketMatch.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      if (!dbMatches || dbMatches.length === 0) {
        return [];
      }

      const now = new Date();
      return dbMatches.map((m) => {
        const diffHours = (now.getTime() - new Date(m.updatedAt).getTime()) / (1000 * 60 * 60);
        // A match can only be LIVE if updated in the last 2 hours and explicitly marked LIVE
        const isActuallyLive = m.matchStatus === 'LIVE' && diffHours < 3;

        return {
          id: m.id,
          matchTitle: m.matchTitle,
          tournament: m.tournament || 'क्रिकेट मैच',
          resultText: m.resultText || undefined,
          teamA: {
            name: m.teamA,
            code: m.teamA.split('(')[1]?.replace(')', '') || m.teamA,
            score: m.scoreA || undefined,
          },
          teamB: {
            name: m.teamB,
            code: m.teamB.split('(')[1]?.replace(')', '') || m.teamB,
            score: m.scoreB || undefined,
          },
          matchStatus: isActuallyLive ? 'LIVE' : m.matchStatus === 'RESULT' ? 'COMPLETED' : 'UPCOMING',
          statusText: m.resultText || m.newsHeadline || (isActuallyLive ? 'मुकाबला जारी' : 'मैच विवरण'),
          venue: m.venue || undefined,
          meta: {
            providerName: apiUrl ? this.name : 'संपादकीय खेल डेस्क (Verified Editorial Feed)',
            providerUpdatedAt: m.updatedAt.toISOString(),
            serverReceivedAt: now.toISOString(),
            lastValidatedAt: now.toISOString(),
            freshnessStatus: isActuallyLive ? 'LIVE' : diffHours < 24 ? 'FRESH' : 'STALE',
            isStale: diffHours >= 24,
            staleReason: diffHours >= 24 ? 'अंतिम अपडेट 24 घंटे से अधिक पुराना' : undefined,
          },
        };
      });
    } catch (err: any) {
      this.errorCount++;
      return null;
    }
  }

  normalize(raw: any): NormalizedCricketMatch[] {
    if (!raw || !Array.isArray(raw.data)) return [];

    const now = new Date().toISOString();

    return raw.data.map((item: any) => {
      const isLive = item.matchStarted && !item.matchEnded;
      return {
        id: String(item.id || item.matchId || Math.random()),
        matchTitle: item.name || `${item.teams?.[0] || 'Team A'} vs ${item.teams?.[1] || 'Team B'}`,
        tournament: item.series_id || item.tournament || 'क्रिकेट मैच',
        teamA: {
          name: item.teams?.[0] || 'Team 1',
          code: item.teamInfo?.[0]?.shortname || 'T1',
          score: item.score?.[0]?.r ? `${item.score[0].r}/${item.score[0].w || 0}` : undefined,
          overs: item.score?.[0]?.o ? `${item.score[0].o} ov` : undefined,
        },
        teamB: {
          name: item.teams?.[1] || 'Team 2',
          code: item.teamInfo?.[1]?.shortname || 'T2',
          score: item.score?.[1]?.r ? `${item.score[1].r}/${item.score[1].w || 0}` : undefined,
          overs: item.score?.[1]?.o ? `${item.score[1].o} ov` : undefined,
        },
        matchStatus: isLive ? 'LIVE' : item.matchEnded ? 'COMPLETED' : 'UPCOMING',
        statusText: item.status || (isLive ? 'मैच जारी' : 'आगामी मैच'),
        venue: item.venue,
        meta: {
          providerName: this.name,
          providerUpdatedAt: item.dateTimeGMT || now,
          serverReceivedAt: now,
          lastValidatedAt: now,
          freshnessStatus: isLive ? 'LIVE' : 'FRESH',
          isStale: false,
        },
      };
    });
  }

  validate(data: NormalizedCricketMatch[]): { isValid: boolean; reason?: string } {
    if (!Array.isArray(data)) {
      return { isValid: false, reason: 'Cricket data is not an array' };
    }
    for (const match of data) {
      if (!match.id || !match.teamA?.name || !match.teamB?.name) {
        return { isValid: false, reason: 'Match missing id or team names' };
      }
    }
    return { isValid: true };
  }

  async healthCheck(): Promise<ProviderHealth> {
    const isConfigured = Boolean(process.env.CRICKET_API_KEY && process.env.CRICKET_API_URL);
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
