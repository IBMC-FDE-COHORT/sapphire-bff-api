import { GraphQLError } from 'graphql';
import { temperatureChartResolver } from '../temperatureChart.resolver';
import type { TemperatureChartData } from '../temperatureChart.types';

const CHART_DATA: TemperatureChartData = {
  userId: 'user-abc',
  unit: 'CELSIUS',
  range: 'WEEK',
  dataPoints: [
    { periodStart: '2026-09-01', minCelsius: 36.4, maxCelsius: 37.8, avgCelsius: 37.1, recordCount: 4 },
  ],
};

function makeContext(sub: string, loaderResult: TemperatureChartData | null, loadSpy?: jest.Mock) {
  const load = loadSpy ?? jest.fn().mockResolvedValue(loaderResult);
  return { user: { sub }, loaders: { temperatureChart: { load } } };
}

const resolver = temperatureChartResolver.Query.temperatureChart;

describe('temperatureChartResolver', () => {
  it('returns chart data when userId matches JWT subject', async () => {
    const ctx = makeContext('user-abc', CHART_DATA);
    const result = await resolver(undefined, { userId: 'user-abc', range: 'WEEK' }, ctx as never);
    expect(result).toEqual(CHART_DATA);
  });

  it('returns null when loader resolves null (empty range)', async () => {
    const ctx = makeContext('user-abc', null);
    const result = await resolver(undefined, { userId: 'user-abc', range: 'MONTH' }, ctx as never);
    expect(result).toBeNull();
  });

  it('throws FORBIDDEN when userId does not match JWT subject', async () => {
    const ctx = makeContext('other-user', CHART_DATA);
    await expect(
      resolver(undefined, { userId: 'user-abc', range: 'WEEK' }, ctx as never),
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('calls DataLoader with correct key including deviceSource null', async () => {
    const load = jest.fn().mockResolvedValue(CHART_DATA);
    const ctx = { user: { sub: 'user-abc' }, loaders: { temperatureChart: { load } } };
    await resolver(undefined, { userId: 'user-abc', range: 'WEEK' }, ctx as never);
    expect(load).toHaveBeenCalledWith({ userId: 'user-abc', range: 'WEEK', deviceSource: null });
  });
});
