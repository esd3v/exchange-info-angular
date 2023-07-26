import { CandlesState } from '../features/candles/store/candles.state';
import { ExchangeInfoState } from '../features/exchange-info/store/exchange-info.state';
import { OrderBookState } from '../features/order-book/store/order-book.state';
import { TickerState } from '../features/ticker/store/ticker.state';
import { TradesState } from '../features/trades/store/trades.state';
import { SymbolsState } from '../features/symbols/store/symbols.state';

export type AppState = {
  ticker: TickerState;
  symbols: SymbolsState;
  exchangeInfo: ExchangeInfoState;
  candles: CandlesState;
  orderBook: OrderBookState;
  trades: TradesState;
};

export type LoadingStatus = 'init' | 'loading' | 'error' | 'success';
