import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from '..';
import { globalSelectors } from '../global';

export const featureSelector =
  createFeatureSelector<AppState['ticker']>('ticker');

export const globalSelector =
  createFeatureSelector<AppState['global']>('global');

export const globalSymbol = globalSelectors.globalSymbol;

export const currentTicker = createSelector(
  featureSelector,
  globalSymbol,
  (state, globalSymbol) =>
    state.data?.find((item) => item.symbol === globalSymbol)
);

export const lastPrice = createSelector(
  currentTicker,
  (state) => state?.lastPrice
);

export const priceChange = createSelector(
  currentTicker,
  (state) => state?.priceChange
);

export const priceChangePercent = createSelector(
  currentTicker,
  (state) => state?.priceChangePercent
);

export const lastQuantity = createSelector(
  currentTicker,
  (state) => state?.lastQty
);

export const numberOfTrades = createSelector(
  currentTicker,
  (state) => state?.count
);

export const loading = createSelector(
  featureSelector,
  (state) => state.status === 'loading'
);
