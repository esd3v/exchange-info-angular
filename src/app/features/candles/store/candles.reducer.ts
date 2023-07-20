import { createReducer, on } from '@ngrx/store';
import { candlesActions } from '.';
import { Candle } from '../types/candle';
import { CandleEntity, candlesAdapter, initialState } from './candles.state';

// OHLC order is different on purpose (for echarts)
const createCandleEntity = (candle: Candle): CandleEntity => ({
  close: candle[4],
  high: candle[2],
  low: candle[3],
  open: candle[1],
  openTime: candle[0],
  volume: candle[5],
});

export const candlesReducer = createReducer(
  initialState,
  on(candlesActions.load, (state) => {
    return candlesAdapter.setAll([], {
      ...state,
      status: 'loading',
    });
  }),
  on(candlesActions.loadSuccess, (state, { candles, interval }) => {
    const mapped = candles.map(createCandleEntity) as CandleEntity[];

    return candlesAdapter.setAll(mapped, {
      ...state,
      status: 'success',
      interval: interval || state.interval,
    });
  }),
  on(candlesActions.setInterval, (state, { interval }) => {
    return {
      ...state,
      interval,
    };
  }),
  on(candlesActions.addCandleAndRemoveFirst, (state, { candle }) => {
    const id = state.ids[0] as string;
    const added = candlesAdapter.addOne(createCandleEntity(candle), state);
    const final = candlesAdapter.removeOne(id, added);

    return final;
  }),
  on(candlesActions.updateCandle, (state, { candle }) => {
    const entity = createCandleEntity(candle);
    const id = entity.openTime.toString();

    return candlesAdapter.updateOne({ id, changes: entity }, state);
  })
);
