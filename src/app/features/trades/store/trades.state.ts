import { LoadingStatus } from 'src/app/store/state';
import { Trades } from '../types/trades';

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
