import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { symbolsAdapter } from './exchange-info.state';

const state = createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');
const symbolState = createSelector(state, (state) => state.symbols);

export const status = createSelector(state, (state) => state.status);

const { selectAll, selectEntities } = symbolsAdapter.getSelectors();

export const allSymbols = createSelector(symbolState, selectAll);

export const firstSymbol = createSelector(allSymbols, (state) => state[0]);

export const symbols = createSelector(symbolState, selectEntities);

export const tradingSymbols = createSelector(allSymbols, (state) => {
  return state?.filter((item) => item?.status === 'TRADING');
});
