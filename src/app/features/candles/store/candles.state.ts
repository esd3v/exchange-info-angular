import { EntityAdapter, createEntityAdapter, EntityState } from '@ngrx/entity';
import { LoadingStatus } from 'src/app/store/state';
import { CandleInterval } from '../models/candle-interval.model';

export interface CandleEntity {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export const candlesAdapter: EntityAdapter<CandleEntity> =
  createEntityAdapter<CandleEntity>({
    selectId: (item) => item.openTime,
  });

export interface CandlesState extends EntityState<CandleEntity> {
  status: LoadingStatus;
  interval: CandleInterval;
}

export const initialState: CandlesState = candlesAdapter.getInitialState({
  status: 'init',
  interval: '1m',
});
