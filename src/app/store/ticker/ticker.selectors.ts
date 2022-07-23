import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';

export const featureSelector =
  createFeatureSelector<AppState['ticker']>('ticker');

export const lastPrice = createSelector(
  featureSelector,
  (state) => state.data.lastPrice
);

export const prevLastPrice = createSelector(
  featureSelector,
  (state) => state.data.prevLastPrice
);

export const priceChange = createSelector(
  featureSelector,
  (state) => state.data.priceChange
);

export const priceChangePercent = createSelector(
  featureSelector,
  (state) => state.data.priceChangePercent
);

export const lastQuantity = createSelector(
  featureSelector,
  (state) => state.data.lastQuantity
);

export const numberOfTrades = createSelector(
  featureSelector,
  (state) => state.data.numberOfTrades
);

export const loading = createSelector(
  featureSelector,
  (state) => state.status === 'loading'
);
