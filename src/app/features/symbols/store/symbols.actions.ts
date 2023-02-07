import { createAction, props } from '@ngrx/store';
import { ExchangeInfo } from 'src/app/features/exchange-info/types/exchange-info';

const PREFIX = '[SYMBOLS]';
const CREATE = `${PREFIX} CREATE`;

export const create = createAction(CREATE, props<ExchangeInfo>());
