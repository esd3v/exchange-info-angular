import { ExchangeInfoParsed } from './../../models/exchange-info-parsed.model';
import { LoadingStatus } from '../state';
import { TickerState } from '../ticker/ticker.state';

export type PairsState = {
  data: (ExchangeInfoParsed['symbolInfo'] &
    Partial<
      Pick<
        TickerState['data'],
        'lastPrice' | 'priceChangePercent' | 'prevLastPrice'
      >
    >)[];
  pageSymbols: string[];
  status: LoadingStatus;
};

export const initialState: PairsState = {
  data: [],
  pageSymbols: [],
  status: 'init',
};
