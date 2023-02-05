import { createAction, props } from '@ngrx/store';
import { ExchangeInfo } from '../types/exchange-info';

const PREFIX = '[EXCHANGE INFO]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;

export const load = createAction(LOAD);

export const loadSuccess = createAction(SUCCESS, props<ExchangeInfo>());
