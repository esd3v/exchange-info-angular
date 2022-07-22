import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['ticker']>('ticker');

export const lastPrice = createSelector(
  featureSelector,
  (state) => state.lastPrice
);

export const prevLastPrice = createSelector(
  featureSelector,
  (state) => state.prevLastPrice
);

export const priceChange = createSelector(
  featureSelector,
  (state) => state.priceChange
);

export const priceChangePercent = createSelector(
  featureSelector,
  (state) => state.priceChangePercent
);
