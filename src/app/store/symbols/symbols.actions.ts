import { createAction, props } from '@ngrx/store';
import { ExchangeInfo } from 'src/app/features/exchange-info/models/exchange-info.model';

const PREFIX = '[SYMBOLS]';
const CREATE = `${PREFIX} CREATE`;

export const create = createAction(CREATE, props<ExchangeInfo>());
