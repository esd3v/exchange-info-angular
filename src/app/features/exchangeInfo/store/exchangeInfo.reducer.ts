import { createReducer, on } from '@ngrx/store';
import { exchangeInfoActions } from '.';
import { initialState } from './exchangeInfo.state';

export const exchangeInfoReducer = createReducer(
  initialState,
  on(exchangeInfoActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(exchangeInfoActions.loadSuccess, (state, { symbols, serverTime }) => ({
    ...state,
    data: {
      serverTime,
      symbols,
    },
    status: 'success',
  }))
);
