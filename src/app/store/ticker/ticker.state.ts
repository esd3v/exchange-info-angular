import { ParsedTicker } from './../../models/parsed-ticker.model';

export type TickerState = {
  [key in keyof ParsedTicker]: ParsedTicker[key] | null;
} & {
  // TODO remove undefined
  prevLastPrice: number | undefined | null;
};

export const initialState: TickerState = {
  lastPrice: null,
  lastQuantity: null,
  numberOfTrades: null,
  prevLastPrice: undefined,
  priceChange: null,
  priceChangePercent: null,
  symbol: null,
};
