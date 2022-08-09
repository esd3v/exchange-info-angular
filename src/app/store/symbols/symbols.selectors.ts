import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';
import { symbolsAdapter } from './symbols.state';

const featureSelector = createFeatureSelector<AppState['symbols']>('symbols');

const { selectAll, selectEntities, selectIds, selectTotal } =
  symbolsAdapter.getSelectors();

export const ids = createSelector(featureSelector, selectIds);

export const allSymbols = createSelector(featureSelector, selectAll);

export const firstSymbol = createSelector(allSymbols, (state) => state[0]);

export const symbols = createSelector(featureSelector, selectEntities);

export const tradingSymbols = createSelector(allSymbols, (state) => {
  return state?.filter((item) => item?.status === 'TRADING');
});
