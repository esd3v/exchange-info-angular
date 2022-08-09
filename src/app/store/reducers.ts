import { symbolsReducer } from './symbols/symbols.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { globalReducer } from './global/global.reducer';
import { AppState } from './state';
import { tickerReducer } from '../features/ticker/store/ticker.reducer';
import { exchangeInfoReducer } from '../features/exchange-info/store/exchange-info.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  ticker: tickerReducer,
  symbols: symbolsReducer,
  exchangeInfo: exchangeInfoReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
