import { createAction, props } from '@ngrx/store';
import { CandleInterval } from '../types/candle-interval';
import { Candle } from '../types/candle';
import { CandlesGetParams } from '../types/candles-get-params';

const PREFIX = '[CANDLES]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const SET_INTERVAL = `${PREFIX} SET INTERVAL`;
const ADD_CANDLE = `${PREFIX} ADD CANDLE`;
const REMOVE_FIRST_CANDLE = `${PREFIX} REMOVE FIRST CANDLE`;
const UPDATE_CANDLE = `${PREFIX} UPDATE CANDLE`;

export const load = createAction(LOAD, props<CandlesGetParams>());

export const loadSuccess = createAction(
  SUCCESS,
  props<{ candles: Candle[]; interval?: CandleInterval }>()
);

export const setInterval = createAction(
  SET_INTERVAL,
  props<{ interval: CandleInterval }>()
);

export const addCandle = createAction(ADD_CANDLE, props<{ candle: Candle }>());

export const removeFirstCandle = createAction(REMOVE_FIRST_CANDLE);

export const updateCandle = createAction(
  UPDATE_CANDLE,
  props<{ candle: Candle }>()
);
