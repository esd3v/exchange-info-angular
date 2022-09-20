import { LoadingStatus } from 'src/app/store/state';
import { OrderBook } from '../models/order-book.model';

export type OrderBookState = {
  status: LoadingStatus;
} & OrderBook;

export const initialState: OrderBookState = {
  status: 'init',
  asks: [],
  bids: [],
  lastUpdateId: -1,
};
