import { createAction, props } from '@ngrx/store';
import { OrderBookGetParams } from '../models/order-book-get-params.model';
import { OrderBook } from '../models/order-book.model';

const PREFIX = '[ORDER BOOK]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;

export const load = createAction(LOAD, props<{ params: OrderBookGetParams }>());

export const loadSuccess = createAction(SUCCESS, props<OrderBook>());
