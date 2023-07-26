import { EntityAdapter, EntityState, createEntityAdapter } from '@ngrx/entity';
import { LoadingStatus } from 'src/app/store/state';

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
}

export const initialState: CandlesState = candlesAdapter.getInitialState({
  status: 'init',
});
