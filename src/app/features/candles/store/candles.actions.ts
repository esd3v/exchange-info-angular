import { createAction, props } from '@ngrx/store';
import { Candle } from '../types/candle';
import { CandleInterval } from '../types/candle-interval';
import { CandlesGetParams } from '../types/candles-get-params';

const PREFIX = '[CANDLES]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const ADD_CANDLE_AND_REMOVE_FIRST = `${PREFIX} ADD CANDLE AND REMOVE FIRST`;
const UPDATE_CANDLE = `${PREFIX} UPDATE CANDLE`;

export const load = createAction(LOAD, props<CandlesGetParams>());

export const loadSuccess = createAction(
  SUCCESS,
  props<{ candles: Candle[]; interval?: CandleInterval }>()
);

export const addCandleAndRemoveFirst = createAction(
  ADD_CANDLE_AND_REMOVE_FIRST,
  props<{ candle: Candle }>()
);

export const updateCandle = createAction(
  UPDATE_CANDLE,
  props<{ candle: Candle }>()
);
