import { PairsState } from './pairs/pairs.state';
import { TickerState } from './ticker/ticker.state';
import { GlobalState } from './global/global.state';
import { ExchangeInfoState } from './exchangeInfo/exchangeInfo.state';

export type AppState = {
  global: GlobalState;
  ticker: TickerState;
  pairs: PairsState;
  exchangeInfo: ExchangeInfoState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
