import { createReducer, on } from '@ngrx/store';
import { exchangeInfoActions } from '.';
import {
  exchangeInfoAdapter,
  ExchangeSymbolEntity,
  initialState,
} from './exchange-info.state';

export const exchangeInfoReducer = createReducer(
  initialState,
  on(exchangeInfoActions.load, (state) => {
    return exchangeInfoAdapter.updateMany([], {
      ...state,
      status: 'loading',
    });
  }),
  on(exchangeInfoActions.loadSuccess, (state, { symbols }) => {
    const filtered = symbols.map((item) => {
      const { orderTypes, filters, permissions, ...rest } = item;

      return rest;
    }) as ExchangeSymbolEntity[];

    return exchangeInfoAdapter.addMany(filtered, {
      ...state,
      status: 'success',
    });
  })
);
