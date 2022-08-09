import { Ticker } from 'src/app/features/tickers/models/ticker.model';
import { LoadingStatus } from '../../../store/state';

export type TickersState = {
  data: Ticker[] | null;
  status: LoadingStatus;
};

export const initialState: TickersState = {
  data: null,
  status: 'init',
};
