/**
 * Common Base Interface for all Live Data Provider Adapters
 */

import { ProviderHealth } from '../types';

export interface BaseLiveAdapter<T> {
  providerId: string;
  category: 'cricket' | 'bullion' | 'market';
  name: string;

  /**
   * Fetches the latest live data from authorized provider
   */
  fetchLatest(): Promise<T | null>;

  /**
   * Normalizes provider-specific payload into standard Dainik Manyavar format
   */
  normalize(raw: any): T;

  /**
   * Strict validation layer: Rejects impossible numbers, nulls, missing fields
   */
  validate(data: T): { isValid: boolean; reason?: string };

  /**
   * Health check for administrative monitoring
   */
  healthCheck(): Promise<ProviderHealth>;
}
