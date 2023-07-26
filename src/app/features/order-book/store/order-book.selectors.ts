import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const state = createFeatureSelector<AppState['orderBook']>('orderBook');

export const status = createSelector(state, (state) => state.status);

export const bids = createSelector(state, (state) => state.bids);

export const asks = createSelector(state, (state) => state.asks);

export const lastUpdateId = createSelector(
  state,
  (state) => state.lastUpdateId
);
