import { actions } from 'src/app/store';
import { createReducer, on } from '@ngrx/store';
import { initialState } from './exchangeInfo.state';

export const exchangeInfoReducer = createReducer(
  initialState,
  on(actions.exchangeInfo.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(actions.exchangeInfo.loadSuccess, (state, { symbols, serverTime }) => ({
    ...state,
    data: {
      serverTime,
      symbols,
    },
    status: 'success',
  }))
);
