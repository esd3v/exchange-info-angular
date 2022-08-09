import { ExchangeInfoState } from '../features/exchange-info/store/exchange-info.state';
import { TickerState } from '../features/ticker/store/ticker.state';
import { GlobalState } from './global/global.state';
import { SymbolsState } from './symbols/symbols.state';

export type AppState = {
  global: GlobalState;
  ticker: TickerState;
  symbols: SymbolsState;
  exchangeInfo: ExchangeInfoState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
