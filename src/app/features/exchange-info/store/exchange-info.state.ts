import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { ValueOf } from 'src/app/shared/types/misc';
import { LoadingStatus } from 'src/app/store/state';
import { ExchangeSymbol } from '../types/exchange-symbol';
import { PriceFilter } from '../types/symbol-filters';

export interface ExchangeInfoState {
  status: LoadingStatus;
  symbols: SymbolsState;
}

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

export const initialState: ExchangeInfoState = {
  status: 'init',
  symbols: symbolsAdapter.getInitialState(),
};
