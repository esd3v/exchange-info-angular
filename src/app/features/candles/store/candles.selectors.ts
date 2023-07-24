import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesAdapter } from './candles.state';

const featureSelector = createFeatureSelector<AppState['candles']>('candles');
const { selectAll } = candlesAdapter.getSelectors();
const allCandles = createSelector(featureSelector, selectAll);

export const candles = createSelector(allCandles, (state) => state);

export const interval = createSelector(
  featureSelector,
  (state) => state.interval
);

export const status = createSelector(featureSelector, (state) => state.status);
