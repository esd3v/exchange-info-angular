import { CandlesState } from '../features/candles/store/candles.state';
import { ExchangeInfoState } from '../features/exchange-info/store/exchange-info.state';
import { OrderBookState } from '../features/order-book/store/order-book.state';
import { TickersState } from '../features/tickers/store/tickers.state';
import { TradesState } from '../features/trades/store/trades.state';
import { SymbolsState } from '../features/symbols/store/symbols.state';
import { GlobalState } from '../features/global/store/global.state';

export type AppState = {
  global: GlobalState;
  tickers: TickersState;
  symbols: SymbolsState;
  exchangeInfo: ExchangeInfoState;
  candles: CandlesState;
  orderBook: OrderBookState;
  trades: TradesState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
