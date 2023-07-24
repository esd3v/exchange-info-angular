import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';
import { OrderBookGetParams } from '../types/order-book-get-params';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  asks$ = this.store$.select(orderBookSelectors.asks);

  bids$ = this.store$.select(orderBookSelectors.bids);

  constructor(
    private store$: Store<AppState>,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  handleWebsocketData({ asks, bids, lastUpdateId }: WebsocketOrderBook) {
    this.setOrderBook({
      asks,
      bids,
      lastUpdateId,
    });
  }

  setOrderBook(orderBook: OrderBook) {
    this.store$.dispatch(orderBookActions.set(orderBook));
  }

  loadData({ symbol, limit = WIDGET_DEPTH_DEFAULT_LIMIT }: OrderBookGetParams) {
    this.store$.dispatch(orderBookActions.load({ symbol, limit }));
  }
}
