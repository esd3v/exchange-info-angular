import { createReducer, on } from '@ngrx/store';
import { tickersActions } from '.';
import { initialState } from './tickers.state';

export const tickersReducer = createReducer(
  initialState,
  on(tickersActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(tickersActions.create, (state, { data }) => ({
    ...state,
    data,
  })),
  on(tickersActions.loadSuccess, (state, { data }) => ({
    ...state,
    data,
    status: 'success',
  })),
  on(tickersActions.update, (state, { symbol, data }) => {
    const tickers = state.data?.map((item) =>
      item.symbol === symbol ? { ...item, ...data } : item
    );

    return {
      ...state,
      data: tickers || null,
      status: 'success',
    };
  })
);
