import { Ticker } from '../../tickers/models/ticker.model';

export interface OrderBookColumn {
  id: 'price' | 'amount' | 'total';
  numeric: boolean;
  label: string;
}
