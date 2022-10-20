import { CandleInterval } from './candle-interval.model';

export interface WebsocketCandlesStreamParams {
  symbol: string;
  interval: CandleInterval;
}
