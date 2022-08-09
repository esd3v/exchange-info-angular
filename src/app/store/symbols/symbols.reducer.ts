import { createReducer, on } from '@ngrx/store';
import { symbolsActions } from '.';
import {
  symbolsAdapter,
  ExchangeSymbolEntity,
  initialState,
} from './symbols.state';

export const symbolsReducer = createReducer(
  initialState,
  on(symbolsActions.create, (state, { symbols }) => {
    const filtered = symbols.map((item) => {
      const { orderTypes, filters, permissions, ...rest } = item;

      return rest;
    }) as ExchangeSymbolEntity[];

    return symbolsAdapter.addMany(filtered, {
      ...state,
    });
  })
);
