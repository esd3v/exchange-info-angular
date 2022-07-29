import { Ticker } from 'src/app/features/ticker/models/ticker.model';
import { LoadingStatus } from '../../../store/state';

export type TickerState = {
  data: Ticker[] | null;
  status: LoadingStatus;
};

export const initialState: TickerState = {
  data: null,
  status: 'init',
};
