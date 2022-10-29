import { createAction, props } from '@ngrx/store';
import { TradesGetParams } from '../models/trades-get-params.model';
import { Trades } from '../models/trades.model';
import { TradesEntity } from './trades.state';

const PREFIX = '[TRADES]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const ADD = `${PREFIX} ADD`;
const REMOVE_LAST = `${PREFIX} REMOVE LAST`;

export const load = createAction(LOAD, props<{ params: TradesGetParams }>());

export const loadSuccess = createAction(SUCCESS, props<{ trades: Trades[] }>());

export const add = createAction(ADD, props<{ trades: TradesEntity }>());

export const removeLast = createAction(REMOVE_LAST);
