import { TickerState } from '../features/ticker/store/ticker.state';
import { GlobalState } from './global/global.state';
import { ExchangeInfoState } from '../features/exchangeInfo/store/exchangeInfo.state';

export type AppState = {
  global: GlobalState;
  ticker: TickerState;
  exchangeInfo: ExchangeInfoState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
