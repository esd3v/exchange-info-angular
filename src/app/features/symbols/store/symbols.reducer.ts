import { createReducer, on } from '@ngrx/store';
import { symbolsActions } from '.';
import { PriceFilter } from '../../exchange-info/types/symbol-filters';
import {
  symbolsAdapter,
  ExchangeSymbolEntity,
  initialState,
} from './symbols.state';

export const symbolsReducer = createReducer(
  initialState,
  on(symbolsActions.create, (state, { symbols }) => {
    const mapped = symbols.map((item) => {
      const { symbol, baseAsset, quoteAsset, status, filters } = item;

      // TODO Move filter to a new store slice?
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

    return symbolsAdapter.setAll(mapped, state);
  })
);
