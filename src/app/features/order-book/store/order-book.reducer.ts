import { createReducer, on } from '@ngrx/store';
import { orderBookActions } from '.';
import { initialState } from './order-book.state';

export const orderBookReducer = createReducer(
  initialState,
  on(orderBookActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(orderBookActions.loadSuccess, (state, { asks, bids, lastUpdateId }) => ({
    ...state,
    asks,
    bids,
    lastUpdateId,
    status: 'success',
  })),
  on(orderBookActions.set, (state, { asks, bids, lastUpdateId }) => ({
    ...state,
    asks,
    bids,
    lastUpdateId,
  }))
);
