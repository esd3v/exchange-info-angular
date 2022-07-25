import { actions } from 'src/app/store';
import { createReducer, on } from '@ngrx/store';
import { initialState } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(actions.ticker.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(actions.ticker.loadSuccess, (state, { data }) => ({
    ...state,
    data,
    status: 'success',
  }))
);
