import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { LoadingStatus } from '../../../store/state';
import { ExchangeSymbol } from '../models/exchange-symbol.model';

export type ExchangeSymbolEntity = Exclude<
  ExchangeSymbol,
  'orderTypes' | 'filters' | 'permissions'
>;

export const exchangeInfoAdapter: EntityAdapter<ExchangeSymbolEntity> =
  createEntityAdapter<ExchangeSymbolEntity>({
    selectId: (item) => item.symbol,
  });

export interface ExchangeInfoState extends EntityState<ExchangeSymbolEntity> {
  status: LoadingStatus;
}

export const initialState: ExchangeInfoState =
  exchangeInfoAdapter.getInitialState({
    status: 'init',
  });
