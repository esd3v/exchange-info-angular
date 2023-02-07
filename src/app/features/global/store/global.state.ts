import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';

export interface GlobalState {
  currency: Record<'base' | 'quote', string | null>;
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
