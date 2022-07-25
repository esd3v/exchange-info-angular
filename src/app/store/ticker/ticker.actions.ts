import { createAction, props } from '@ngrx/store';
import { ParsedTicker } from 'src/app/models/parsed-ticker.model';

const PREFIX = '[TICKER]';
const TICKER_LOAD = `${PREFIX} LOAD`;
const TICKER_SUCCESS = `${PREFIX} SUCCESS`;
const TICKER_ERROR = `${PREFIX} ERROR`;

export const load = createAction(TICKER_LOAD, props<{ symbol: string }>());

export const loadSuccess = createAction(
  TICKER_SUCCESS,
  props<{ payload: ParsedTicker }>()
);

export const loadFail = createAction(
  TICKER_ERROR,
  props<{ payload: ParsedTicker }>()
);
