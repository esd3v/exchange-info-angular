import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AppState } from './state';
import { tickerReducer } from '../features/ticker/store/ticker.reducer';
import { exchangeInfoReducer } from '../features/exchange-info/store/exchange-info.reducer';
import { candlesReducer } from '../features/candles/store/candles.reducer';
import { orderBookReducer } from '../features/order-book/store/order-book.reducer';
import { tradesReducer } from '../features/trades/store/trades.reducer';

export const reducers: ActionReducerMap<AppState> = {
  ticker: tickerReducer,
  exchangeInfo: exchangeInfoReducer,
  candles: candlesReducer,
  orderBook: orderBookReducer,
  trades: tradesReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
