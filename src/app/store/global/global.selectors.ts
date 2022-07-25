import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['global']>('global');

export const globalPair = createSelector(featureSelector, (state) => {
  const { base, quote } = state.currency;

  return base ? `${base}/${quote}` : null;
});

export const globalSymbol = createSelector(globalPair, (state) => {
  return state?.replace('/', '');
});

export const globalPairUnderscore = createSelector(globalPair, (state) => {
  return state?.replace('/', '_');
});
