import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { globalReducer } from './global/global.reducer';
import { AppState } from './state';
import { tickerReducer } from './ticker/ticker.reducer';

export const reducers: ActionReducerMap<AppState> = {
  global: globalReducer,
  ticker: tickerReducer,
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
