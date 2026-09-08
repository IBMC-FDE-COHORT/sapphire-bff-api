import { GraphQLError } from 'graphql';
import type { AppContext } from '../../context';
import type { ChartRange } from './temperatureChart.loader';
import type { TemperatureChartData } from './temperatureChart.types';

interface TemperatureChartArgs {
  userId: string;
  range: ChartRange;
  deviceSource?: string;
}

/**
 * Resolver for the `temperatureChart` query field.
 *
 * Validates that the caller's JWT subject matches the requested userId,
 * then delegates to the per-request TemperatureChartLoader. Returns null
 * (not an error) when the user has no temperature records for the range.
 */
export const temperatureChartResolver = {
  Query: {
    temperatureChart: async (
      _: unknown,
      args: TemperatureChartArgs,
      context: AppContext,
    ): Promise<TemperatureChartData | null> => {
      if (context.user.sub !== args.userId) {
        throw new GraphQLError('Access denied to the requested user\'s data', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return context.loaders.temperatureChart.load({
        userId: args.userId,
        range: args.range,
        deviceSource: args.deviceSource ?? null,
      });
    },
  },
};
