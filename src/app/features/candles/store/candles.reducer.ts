import { createReducer, on } from '@ngrx/store';
import { candlesActions } from '.';
import { Candle } from '../models/candle.model';
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
  on(candlesActions.addCandle, (state, { candle }) => {
    return candlesAdapter.addOne(createCandleEntity(candle), state);
  }),
  on(candlesActions.removeFirstCandle, (state) => {
    const id = state.ids[0] as string;

    return candlesAdapter.removeOne(id, state);
  }),
  on(candlesActions.updateCandle, (state, { candle }) => {
    const entity = createCandleEntity(candle);
    const id = entity.openTime.toString();

    return candlesAdapter.updateOne({ id, changes: entity }, state);
  })
);
