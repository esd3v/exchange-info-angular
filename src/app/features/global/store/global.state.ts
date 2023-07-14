import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';
import { Currency } from 'src/app/shared/types/currency';

export interface GlobalState {
  currency: Currency;
  notification: {
    type: 'info' | 'error' | 'success';
    message: string;
  };
}

export const initialState: GlobalState = {
  currency: {
    base: APP_DEFAULT_BASE_CURRENCY,
    quote: APP_DEFAULT_QUOTE_CURRENCY,
  },
  notification: {
    type: 'info',
    message: '',
  },
};
