import { createReducer, on } from '@ngrx/store';
import { tradesActions } from '.';
import { initialState } from './trades.state';

export const tradesReducer = createReducer(
  initialState,
  on(tradesActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(tradesActions.loadSuccess, (state, { trades }) => ({
    ...state,
    data: trades,
    status: 'success',
  })),
  on(tradesActions.addAndRemoveLast, (state, payload) => {
    let updated = state.data.slice(0, state.data.length - 1);

    updated.unshift(payload);

    return {
      ...state,
      data: updated,
    };
  }),
);
