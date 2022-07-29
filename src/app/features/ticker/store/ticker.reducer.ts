import { createReducer, on } from '@ngrx/store';
import { tickerActions } from '.';
import { initialState } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(tickerActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(tickerActions.loadSuccess, (state, { data }) => ({
    ...state,
    data,
    status: 'success',
  }))
);
