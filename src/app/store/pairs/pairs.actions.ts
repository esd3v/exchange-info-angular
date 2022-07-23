import { ExchangeInfoParsed } from './../../models/exchange-info-parsed.model';
import { createAction, props } from '@ngrx/store';

const PREFIX = '[PAIRS]';
const CREATE = `${PREFIX} CREATE`;

export const create = createAction(
  CREATE,
  props<{ symbolInfo: ExchangeInfoParsed['symbolInfo'] }>()
);
