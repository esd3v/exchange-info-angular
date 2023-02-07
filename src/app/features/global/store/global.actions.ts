import { GlobalState } from './global.state';
import { createAction, props } from '@ngrx/store';

const PREFIX = '[GLOBAL]';
const SET_CURRENCY = `${PREFIX} SET CURRENCY`;

export const setCurrency = createAction(
  SET_CURRENCY,
  props<{ payload: string | GlobalState['currency'] }>()
);
