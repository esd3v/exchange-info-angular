import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { Ticker } from 'src/app/features/tickers/models/ticker.model';
import { LoadingStatus } from '../../../store/state';

export type TickerEntity = Pick<
  Ticker,
  | 'symbol'
  | 'lastPrice'
  | 'count'
  | 'priceChange'
  | 'priceChangePercent'
  | 'lastQty'
> & { prevLastPrice?: string };

export const tickersAdapter: EntityAdapter<TickerEntity> =
  createEntityAdapter<TickerEntity>({
    selectId: (item) => item.symbol,
  });

export interface TickersState extends EntityState<TickerEntity> {
  status: LoadingStatus;
}

export const initialState: TickersState = tickersAdapter.getInitialState({
  status: 'init',
});
