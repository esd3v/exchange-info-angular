import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesAdapter } from './candles.state';

const state = createFeatureSelector<AppState['candles']>('candles');
const { selectAll } = candlesAdapter.getSelectors();
const allCandles = createSelector(state, selectAll);

export const candles = createSelector(allCandles, (state) => state);

export const status = createSelector(state, (state) => state.status);
