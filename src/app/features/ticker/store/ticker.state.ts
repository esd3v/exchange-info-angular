import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { LoadingStatus } from '../../../store/state';
import { Ticker } from '../types/ticker';

export type TickerEntity = Pick<
  Ticker,
  | 'symbol'
  | 'lastPrice'
  | 'count'
  | 'priceChange'
  | 'priceChangePercent'
  | 'lastQty'
> & { prevLastPrice?: string };

export const tickerAdapter: EntityAdapter<TickerEntity> =
  createEntityAdapter<TickerEntity>({
    selectId: (item) => item.symbol,
  });

export interface TickerState extends EntityState<TickerEntity> {
  status: LoadingStatus;
}

export const initialState: TickerState = tickerAdapter.getInitialState({
  status: 'init',
});
