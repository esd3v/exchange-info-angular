import { ExchangeInfo } from 'src/app/features/exchange-info/models/exchange-info.model';
import { LoadingStatus } from '../../../store/state';

export type ExchangeInfoState = {
  data: Pick<ExchangeInfo, 'symbols' | 'serverTime'> | null;
  status: LoadingStatus;
};

export const initialState: ExchangeInfoState = {
  data: null,
  status: 'init',
};
