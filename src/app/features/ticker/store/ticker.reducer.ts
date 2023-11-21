import { createReducer, on } from '@ngrx/store';
import { tickerActions } from '.';
import { initialState, TickerEntity, tickerAdapter } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(tickerActions.load, (state) => {
    return tickerAdapter.updateMany([], {
      ...state,
      status: 'loading',
    });
  }),
  on(tickerActions.loadSuccess, (state, { data }) => {
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
        prevLastPrice: lastPrice,
      };
    }) as TickerEntity[];

    return tickerAdapter.setAll(mapped, {
      ...state,
      status: 'success',
    });
  }),
  on(tickerActions.update, (state, { data }) => {
    return data.symbol
      ? tickerAdapter.updateOne(
          {
            id: data.symbol,
            changes: {
              ...data,
              prevLastPrice:
                data.lastPrice !== state.entities[data.symbol]?.lastPrice
                  ? state.entities[data.symbol]?.lastPrice
                  : state.entities[data.symbol]?.prevLastPrice,
            },
          },
          state,
        )
      : state;
  }),
);
