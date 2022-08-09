import { exchangeInfoReducer } from '../features/exchange-info/store/exchange-info.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { globalReducer } from './global/global.reducer';
import { AppState } from './state';
import { tickerReducer } from '../features/ticker/store/ticker.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  ticker: tickerReducer,
  exchangeInfo: exchangeInfoReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
