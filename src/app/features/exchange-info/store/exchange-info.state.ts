import { LoadingStatus } from 'src/app/store/state';

export interface ExchangeInfoState {
  status: LoadingStatus;
}

export const initialState: ExchangeInfoState = {
  status: 'init',
};
