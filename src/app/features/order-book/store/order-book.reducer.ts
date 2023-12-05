import { createReducer, on } from '@ngrx/store';
import { orderBookActions } from '.';
import { initialState } from './order-book.state';
import { LoadingStatus } from 'src/app/store/state';

export const orderBookReducer = createReducer(
  initialState,
  on(orderBookActions.load, (state) => ({
    ...state,
    status: 'loading' as LoadingStatus,
  })),
  on(orderBookActions.loadSuccess, (state, { asks, bids, lastUpdateId }) => ({
    ...state,
    asks,
    bids,
    lastUpdateId,
    status: 'success' as LoadingStatus,
  })),
  on(orderBookActions.set, (state, { asks, bids, lastUpdateId }) => ({
    ...state,
    asks,
    bids,
    lastUpdateId,
  })),
);
