import { createReducer, on } from '@ngrx/store';
import { exchangeInfoActions } from '.';
import { initialState } from './exchange-info.state';

export const exchangeInfoReducer = createReducer(
  initialState,
  on(exchangeInfoActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(exchangeInfoActions.loadSuccess, (state) => ({
    ...state,
    status: 'success',
  }))
);
