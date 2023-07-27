import { createReducer, on } from '@ngrx/store';
import { exchangeInfoActions } from '.';
import {
  ExchangeSymbolEntity,
  initialState,
  symbolsAdapter,
} from './exchange-info.state';
import { PriceFilter } from '../types/symbol-filters';

export const exchangeInfoReducer = createReducer(
  initialState,
  on(exchangeInfoActions.load, (state) => ({
    ...state,
    status: 'loading',
  })),
  on(exchangeInfoActions.loadSuccess, (state) => ({
    ...state,
    status: 'success',
  })),
  on(exchangeInfoActions.createSymbols, (state, payload) => {
    const symbols = payload.symbols.map((item) => {
      const { symbol, baseAsset, quoteAsset, status, filters } = item;

      const priceFilter = filters.find(
        ({ filterType }) => filterType === 'PRICE_FILTER'
      ) as PriceFilter | undefined;

      const tickSize = priceFilter?.tickSize;
      const minPrice = priceFilter?.minPrice;
      const maxPrice = priceFilter?.maxPrice;

      return {
        symbol,
        baseAsset,
        quoteAsset,
        status,
        // TODO Add LOT_SIZE (with stepSize) for quantity formatting
        PRICE_FILTER: {
          tickSize,
          maxPrice,
          minPrice,
        },
      };
    }) as ExchangeSymbolEntity[];

    return {
      ...state,
      symbols: symbolsAdapter.setAll(symbols, state.symbols),
    };
  })
);
