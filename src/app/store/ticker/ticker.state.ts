import { Ticker } from 'src/app/models/ticker.model';
import { LoadingStatus } from '../state';

export type TickerState = {
  data: Ticker[] | null;
  status: LoadingStatus;
};

export const initialState: TickerState = {
  data: null,
  status: 'init',
};
