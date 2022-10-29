import { LoadingStatus } from 'src/app/store/state';
import { Trades } from '../models/trades.model';

export type TradesEntity = Pick<
  Trades,
  'price' | 'qty' | 'isBuyerMaker' | 'time'
>;

export type TradesState = {
  status: LoadingStatus;
} & {
  data: TradesEntity[];
};

export const initialState: TradesState = {
  status: 'init',
  data: [],
};
