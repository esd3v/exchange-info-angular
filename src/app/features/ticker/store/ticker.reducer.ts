import { createReducer, on } from '@ngrx/store';
import { tickerActions } from '.';
import { initialState } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(tickerActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(tickerActions.create, (state, { data }) => ({
    ...state,
    data,
  })),
  on(tickerActions.loadSuccess, (state, { data }) => ({
    ...state,
    data,
    status: 'success',
  })),
  on(tickerActions.update, (state, { symbol, data }) => {
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
