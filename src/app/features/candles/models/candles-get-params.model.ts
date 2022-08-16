import { CandleInterval } from './candle-interval.model';

export type CandlesGetParams = {
  symbol: string;
  interval: CandleInterval;
  startTime?: number;
  endTime?: number;
  limit?: number;
};
