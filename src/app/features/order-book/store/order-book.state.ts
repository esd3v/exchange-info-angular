import { LoadingStatus } from 'src/app/store/state';
import { OrderBook } from '../types/order-book';

export type OrderBookState = {
  status: LoadingStatus;
} & OrderBook;

export const initialState: OrderBookState = {
  status: 'init',
  asks: [],
  bids: [],
  lastUpdateId: -1,
};
