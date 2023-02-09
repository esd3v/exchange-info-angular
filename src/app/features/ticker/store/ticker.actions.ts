import { createAction, props } from '@ngrx/store';
import { Ticker } from '../types/ticker';

const PREFIX = '[TICKER]';
const CREATE = `${PREFIX} CREATE`;
const LOAD = `${PREFIX} LOAD`;
const UPDATE = `${PREFIX} UPDATE`;
const SUCCESS = `${PREFIX} SUCCESS`;

export const create = createAction(CREATE, props<{ data: Ticker[] }>());

export const update = createAction(UPDATE, props<{ data: Partial<Ticker> }>());

export const load = createAction(LOAD);

export const loadSuccess = createAction(SUCCESS, props<{ data: Ticker[] }>());
