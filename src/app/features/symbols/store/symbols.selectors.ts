import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '../../../store';
import { symbolsAdapter } from './symbols.state';

const state = createFeatureSelector<AppState['symbols']>('symbols');
const { selectAll, selectEntities, selectIds } = symbolsAdapter.getSelectors();

export const ids = createSelector(state, selectIds);

export const allSymbols = createSelector(state, selectAll);

export const firstSymbol = createSelector(allSymbols, (state) => state[0]);

export const symbols = createSelector(state, selectEntities);

export const tradingSymbols = createSelector(allSymbols, (state) => {
  return state?.filter((item) => item?.status === 'TRADING');
});
