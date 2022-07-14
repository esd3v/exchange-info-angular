import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['global']>('global');

export const globalSymbol = createSelector(featureSelector, (state) => {
  const { base, quote } = state.currency;

  return base ? `${base}${quote}` : undefined;
});

export const globalPair = createSelector(featureSelector, (state) => {
  const { base, quote } = state.currency;

  return base ? `${base}/${quote}` : undefined;
});
