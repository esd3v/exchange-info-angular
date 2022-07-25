import { createAction, props } from '@ngrx/store';
import { Ticker } from 'src/app/models/ticker.model';

const PREFIX = '[TICKER]';
const TICKER_LOAD = `${PREFIX} LOAD`;
const TICKER_SUCCESS = `${PREFIX} SUCCESS`;

export const load = createAction(TICKER_LOAD);

export const loadSuccess = createAction(
  TICKER_SUCCESS,
  props<{ data: Ticker[] }>()
);
