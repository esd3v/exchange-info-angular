import { createAction, props } from '@ngrx/store';
import { Ticker } from 'src/app/features/tickers/models/ticker.model';

const PREFIX = '[TICKER]';
const TICKER_CREATE = `${PREFIX} CREATE`;
const TICKER_LOAD = `${PREFIX} LOAD`;
const TICKER_UPDATE = `${PREFIX} UPDATE`;
const TICKER_SUCCESS = `${PREFIX} SUCCESS`;

export const create = createAction(TICKER_CREATE, props<{ data: Ticker[] }>());

export const update = createAction(
  TICKER_UPDATE,
  props<{ symbol: string; data: Partial<Ticker> }>()
);

export const load = createAction(TICKER_LOAD);

export const loadSuccess = createAction(
  TICKER_SUCCESS,
  props<{ data: Ticker[] }>()
);
