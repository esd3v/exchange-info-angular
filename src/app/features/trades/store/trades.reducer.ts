import { createReducer, on } from '@ngrx/store';
import { tradesActions } from '.';
import { initialState } from './trades.state';
import { LoadingStatus } from 'src/app/store/state';

export const tradesReducer = createReducer(
  initialState,
  on(tradesActions.load, (state) => ({
    ...state,
    status: 'loading' as LoadingStatus,
  })),
  on(tradesActions.loadSuccess, (state, { trades }) => ({
    ...state,
    data: trades,
    status: 'success' as LoadingStatus,
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
