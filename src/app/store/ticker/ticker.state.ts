import { LoadingStatus } from '../state';
import { ParsedTicker } from './../../models/parsed-ticker.model';

export type TickerState = {
  data: {
    [key in keyof ParsedTicker]: ParsedTicker[key] | null;
  } & {
    prevLastPrice: string | null;
  };
  status: LoadingStatus;
};

export const initialState: TickerState = {
  data: {
    lastPrice: null,
    lastQuantity: null,
    numberOfTrades: null,
    prevLastPrice: null,
    priceChange: null,
    priceChangePercent: null,
    symbol: null,
  },
  status: 'init',
};
