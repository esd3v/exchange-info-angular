import { ParsedTicker } from './../../models/parsed-ticker.model';

export type TickerState = {
  [key in keyof ParsedTicker]: ParsedTicker[key] | null;
} & {
  prevLastPrice: number | null;
};

export const initialState: TickerState = {
  lastPrice: null,
  lastQuantity: null,
  numberOfTrades: null,
  prevLastPrice: null,
  priceChange: null,
  priceChangePercent: null,
  symbol: null,
};
