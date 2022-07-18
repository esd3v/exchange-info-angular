import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['ticker']>('ticker');

export const lastPrice = createSelector(
  featureSelector,
  (state) => state.lastPrice
);
