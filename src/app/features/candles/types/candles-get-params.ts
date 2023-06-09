import { CandleInterval } from './candle-interval';

export type CandlesGetParams = {
  symbol: string;
  interval: CandleInterval;
  startTime?: number;
  endTime?: number;
  limit?: number;
};
