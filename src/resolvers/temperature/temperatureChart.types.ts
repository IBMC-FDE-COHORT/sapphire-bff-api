export interface TemperatureDataPoint {
  periodStart: string;
  minCelsius: number;
  maxCelsius: number;
  avgCelsius: number;
  recordCount: number;
}

export interface TemperatureChartData {
  userId: string;
  unit: string;
  range: 'DAY' | 'WEEK' | 'MONTH';
  dataPoints: TemperatureDataPoint[];
}
