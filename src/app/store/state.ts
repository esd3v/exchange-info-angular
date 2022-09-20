import { CandlesState } from '../features/candles/store/candles.state';
import { ExchangeInfoState } from '../features/exchange-info/store/exchange-info.state';
import { OrderBookState } from '../features/order-book/store/order-book.state';
import { TickersState } from '../features/tickers/store/tickers.state';
import { GlobalState } from './global/global.state';
import { SymbolsState } from './symbols/symbols.state';

export type AppState = {
  global: GlobalState;
  tickers: TickersState;
  symbols: SymbolsState;
  exchangeInfo: ExchangeInfoState;
  candles: CandlesState;
  orderBook: OrderBookState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
