import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ValueOf } from 'src/app/shared/types/misc';
import { ExchangeSymbol } from '../../exchange-info/types/exchange-symbol';
import { PriceFilter } from '../../exchange-info/types/symbol-filters';

export type ExchangeSymbolEntity = Pick<
  ExchangeSymbol,
  'symbol' | 'baseAsset' | 'quoteAsset' | 'status'
> &
  Record<
    ValueOf<Pick<PriceFilter, 'filterType'>>,
    Omit<PriceFilter, 'filterType'>
  >;
export const symbolsAdapter: EntityAdapter<ExchangeSymbolEntity> =
  createEntityAdapter<ExchangeSymbolEntity>({
    selectId: (item) => item.symbol,
  });

export interface SymbolsState extends EntityState<ExchangeSymbolEntity> {}

export const initialState: SymbolsState = symbolsAdapter.getInitialState();
