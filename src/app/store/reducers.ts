import { symbolsReducer } from '../features/symbols/store/symbols.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AppState } from './state';
import { tickerReducer } from '../features/ticker/store/ticker.reducer';
import { exchangeInfoReducer } from '../features/exchange-info/store/exchange-info.reducer';
import { candlesReducer } from '../features/candles/store/candles.reducer';
import { orderBookReducer } from '../features/order-book/store/order-book.reducer';
import { tradesReducer } from '../features/trades/store/trades.reducer';
import { globalReducer } from '../features/global/store/global.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  ticker: tickerReducer,
  symbols: symbolsReducer,
  exchangeInfo: exchangeInfoReducer,
  candles: candlesReducer,
  orderBook: orderBookReducer,
  trades: tradesReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
