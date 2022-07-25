import { exchangeInfoReducer } from './exchangeInfo/exchangeInfo.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { globalReducer } from './global/global.reducer';
import { pairsReducer } from './pairs/pairs.reducer';
import { AppState } from './state';
import { tickerReducer } from './ticker/ticker.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  ticker: tickerReducer,
  pairs: pairsReducer,
  exchangeInfo: exchangeInfoReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
