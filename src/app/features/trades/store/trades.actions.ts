import { createAction, props } from '@ngrx/store';
import { TradesGetParams } from '../types/trades-get-params';
import { Trades } from '../types/trades';
import { TradesEntity } from './trades.state';

const PREFIX = '[TRADES]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const ADDANDREMOVELAST = `${PREFIX} ADD AND REMOVE LAST`;

export const load = createAction(LOAD, props<TradesGetParams>());

export const loadSuccess = createAction(SUCCESS, props<{ trades: Trades[] }>());

export const addAndRemoveLast = createAction(
  ADDANDREMOVELAST,
  props<TradesEntity>()
);
