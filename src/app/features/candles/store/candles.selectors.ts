import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getFormattedDate } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { candlesAdapter } from './candles.state';

export const featureSelector =
  createFeatureSelector<AppState['candles']>('candles');

const { selectAll } = candlesAdapter.getSelectors();

export const ohlc = createSelector(selectAll, (state) =>
  state.map(({ open, high, low, close }) => {
    // Order is different for echarts
    return [open, close, low, high];
  })
);

export const volumes = createSelector(selectAll, (state) =>
  state.map((item) => item.volume)
);

export const dates = createSelector(selectAll, (state) =>
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
