import { createAction, props } from '@ngrx/store';
import { OrderBookGetParams } from '../types/order-book-get-params';
import { OrderBook } from '../types/order-book';

const PREFIX = '[ORDER BOOK]';
const LOAD = `${PREFIX} LOAD`;
const SUCCESS = `${PREFIX} SUCCESS`;
const SET = `${PREFIX} SET`;

export const load = createAction(LOAD, props<OrderBookGetParams>());

export const loadSuccess = createAction(SUCCESS, props<OrderBook>());

export const set = createAction(SET, props<OrderBook>());
