import { createReducer, on } from '@ngrx/store';
import { tickersActions } from '.';
import { initialState, TickerEntity, tickersAdapter } from './tickers.state';

export const tickersReducer = createReducer(
  initialState,
  on(tickersActions.load, (state) => {
    return tickersAdapter.updateMany([], {
      ...state,
      status: 'loading',
    });
  }),
  on(tickersActions.loadSuccess, (state, { data }) => {
    const mapped = data.map((item) => {
      const {
        lastPrice,
        lastQty,
        count,
        symbol,
        priceChange,
        priceChangePercent,
      } = item;

      return {
        lastPrice,
        lastQty,
        symbol,
        count,
        priceChange,
        priceChangePercent,
      };
    }) as TickerEntity[];

    return tickersAdapter.setAll(mapped, {
      ...state,
      status: 'success',
    });
  }),
  on(tickersActions.update, (state, { symbol, data }) => {
    return tickersAdapter.updateOne({ id: symbol, changes: data }, state);
  })
);
