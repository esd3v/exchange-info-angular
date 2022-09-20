import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const featureSelector =
  createFeatureSelector<AppState['orderBook']>('orderBook');

export const status = createSelector(featureSelector, (state) => state.status);

export const bids = createSelector(featureSelector, (state) => state.bids);

export const asks = createSelector(featureSelector, (state) => state.asks);

export const lastUpdateId = createSelector(
  featureSelector,
  (state) => state.lastUpdateId
);
