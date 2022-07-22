import { createTicker } from './ticker.actions';
import { createReducer, on } from '@ngrx/store';
import { initialState } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(
    createTicker,
    (
      state,
      {
        payload: {
          lastPrice,
          lastQuantity,
          numberOfTrades,
          priceChange,
          priceChangePercent,
          symbol,
        },
      }
    ) => ({
      ...state,
      symbol,
      lastPrice,
      lastQuantity,
      numberOfTrades,
      priceChange,
      priceChangePercent,
      // TODO Improve
      prevLastPrice:
        symbol !== state.symbol
          ? null
          : lastPrice !== state.lastPrice
          ? state.lastPrice
          : state.prevLastPrice,
    })
  )
);
