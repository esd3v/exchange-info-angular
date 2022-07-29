import { WEBSOCKET_ENABLED } from 'src/app/shared/config';

export interface GlobalState {
  serverTime: string;
  websocketEnabled: boolean;
  currency: Record<'base' | 'quote', string | null>;
  notification: {
    type: 'info' | 'error' | 'success';
    message: string;
  };
}

export const initialState: GlobalState = {
  serverTime: '',
  websocketEnabled: WEBSOCKET_ENABLED,
  currency: {
    base: null,
    quote: null,
  },
  notification: {
    type: 'info',
    message: '',
  },
};
