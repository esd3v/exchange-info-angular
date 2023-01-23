import { createAction, props } from '@ngrx/store';
import { OrderBookGetParams } from '../models/order-book-get-params.model';
import { OrderBook } from '../models/order-book.model';

const PREFIX = '[ORDER BOOK]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const SET = `${PREFIX} SET`;

export const load = createAction(LOAD, props<OrderBookGetParams>());

export const loadSuccess = createAction(SUCCESS, props<OrderBook>());

export const set = createAction(SET, props<OrderBook>());
