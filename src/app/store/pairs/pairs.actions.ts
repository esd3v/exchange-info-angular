import { createAction, props } from '@ngrx/store';
import { ExchangeInfo } from 'src/app/models';

const PREFIX = '[PAIRS]';
const CREATE = `${PREFIX} CREATE`;

export const create = createAction(
  CREATE,
  props<{ symbolInfo: ExchangeInfo['symbols'] }>()
);
