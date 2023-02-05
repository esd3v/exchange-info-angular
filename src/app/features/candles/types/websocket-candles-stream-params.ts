import { CandleInterval } from './candle-interval';

export interface WebsocketCandlesStreamParams {
  symbol: string;
  interval: CandleInterval;
}
