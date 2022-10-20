import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getFormattedDate } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { candlesAdapter } from './candles.state';

export const featureSelector =
  createFeatureSelector<AppState['candles']>('candles');

const { selectAll } = candlesAdapter.getSelectors();
const allCandles = createSelector(featureSelector, selectAll);

export const ohlc = createSelector(allCandles, (state) =>
  state.map(({ open, high, low, close, openTime }) => {
    // Order is different for echarts
    return [open, close, low, high, openTime];
  })
);

export const volumes = createSelector(allCandles, (state) =>
  state.map((item) => item.volume)
);

export const dates = createSelector(allCandles, (state) =>
  state.map((item) =>
    getFormattedDate({
      msec: item.openTime,
    })
  )
);

export const interval = createSelector(
  featureSelector,
  (state) => state.interval
);

export const status = createSelector(featureSelector, (state) => state.status);
