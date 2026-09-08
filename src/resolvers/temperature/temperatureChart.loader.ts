import DataLoader from 'dataloader';
import type { ChartingApiClient } from '../../clients/chartingApiClient';
import type { TemperatureChartData } from './temperatureChart.types';

export type ChartRange = 'DAY' | 'WEEK' | 'MONTH';

export interface TemperatureChartKey {
  userId: string;
  range: ChartRange;
  deviceSource?: string | null;
}

/**
 * Factory that creates a per-request DataLoader for temperature chart queries.
 *
 * Keyed by (userId, range, deviceSource). Batches concurrent queries for the
 * same user within a single request tick, preventing N+1 calls to charting-api.
 * The loader must be instantiated per request (not shared across requests).
 *
 * @param client typed HTTP client for sapphire-charting-api
 */
export function createTemperatureChartLoader(
  client: ChartingApiClient,
): DataLoader<TemperatureChartKey, TemperatureChartData | null> {
  return new DataLoader<TemperatureChartKey, TemperatureChartData | null>(
    async (keys) => {
      return Promise.all(
        keys.map((key) =>
          client
            .getTemperatureChart(key.userId, key.range, key.deviceSource ?? undefined)
            .catch(() => null),
        ),
      );
    },
    {
      cacheKeyFn: (key: TemperatureChartKey) =>
        `${key.userId}:${key.range}:${key.deviceSource ?? ''}`,
    },
  );
}
