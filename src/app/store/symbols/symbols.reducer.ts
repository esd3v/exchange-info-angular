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
      const { symbol, baseAsset, quoteAsset, status } = item;

      return { symbol, baseAsset, quoteAsset, status };
    }) as ExchangeSymbolEntity[];

    return symbolsAdapter.addMany(filtered, {
      ...state,
    });
  })
);
