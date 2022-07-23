import { actions } from 'src/app/store';
import { createReducer, on } from '@ngrx/store';
import { initialState } from './ticker.state';

export const tickerReducer = createReducer(
  initialState,
  on(actions.ticker.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(
    actions.ticker.loadSuccess,
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
      data: {
        ...state.data,
        symbol,
        lastPrice,
        lastQuantity,
        numberOfTrades,
        priceChange,
        priceChangePercent,
        // TODO Improve
        prevLastPrice:
          symbol !== state.data.symbol
            ? null
            : lastPrice !== state.data.lastPrice
            ? state.data.lastPrice
            : state.data.prevLastPrice,
      },
      status: 'success',
    })
  )
);
