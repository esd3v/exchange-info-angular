import { symbolsReducer } from './symbols/symbols.reducer';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { globalReducer } from './global/global.reducer';
import { AppState } from './state';
import { tickersReducer } from '../features/tickers/store/tickers.reducer';
import { exchangeInfoReducer } from '../features/exchange-info/store/exchange-info.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  tickers: tickersReducer,
  symbols: symbolsReducer,
  exchangeInfo: exchangeInfoReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
