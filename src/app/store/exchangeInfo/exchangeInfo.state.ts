import { ExchangeInfo } from './../../models/exchange-info.model';
import { LoadingStatus } from '../state';

export type ExchangeInfoState = {
  data: Pick<ExchangeInfo, 'symbols' | 'serverTime'> | null;
  status: LoadingStatus;
};

export const initialState: ExchangeInfoState = {
  data: null,
  status: 'init',
};
