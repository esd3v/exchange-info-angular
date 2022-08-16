import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ExchangeSymbol } from '../../features/exchange-info/models/exchange-symbol.model';

export type ExchangeSymbolEntity = Pick<
  ExchangeSymbol,
  'symbol' | 'baseAsset' | 'quoteAsset' | 'status'
>;

export const symbolsAdapter: EntityAdapter<ExchangeSymbolEntity> =
  createEntityAdapter<ExchangeSymbolEntity>({
    selectId: (item) => item.symbol,
  });

export interface SymbolsState extends EntityState<ExchangeSymbolEntity> {}

export const initialState: SymbolsState = symbolsAdapter.getInitialState();