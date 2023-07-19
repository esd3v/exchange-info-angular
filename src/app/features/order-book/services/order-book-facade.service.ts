import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';
import { WebsocketOrderBook } from '../types/websocket-order-book';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  public asks$ = this.store$.select(orderBookSelectors.asks);
  public bids$ = this.store$.select(orderBookSelectors.bids);

  public constructor(private store$: Store<AppState>) {}

  public handleWebsocketData({ asks, bids, lastUpdateId }: WebsocketOrderBook) {
    const orderBook: OrderBook = {
      asks,
      bids,
      lastUpdateId,
    };

    this.store$.dispatch(orderBookActions.set(orderBook));
  }

  public loadData({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: Parameters<typeof orderBookActions.load>[0]) {
    this.store$.dispatch(orderBookActions.load({ symbol, limit }));
  }
}
