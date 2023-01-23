export interface GlobalState {
  currency: Record<'base' | 'quote', string | null>;
  notification: {
    type: 'info' | 'error' | 'success';
    message: string;
  };
}

export const initialState: GlobalState = {
  currency: {
    base: 'ETH',
    quote: 'BTC',
  },
  notification: {
    type: 'info',
    message: '',
  },
};
