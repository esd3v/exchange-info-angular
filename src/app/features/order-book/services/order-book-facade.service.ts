import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  public asks$ = this.store$.select(orderBookSelectors.asks);
  public bids$ = this.store$.select(orderBookSelectors.bids);

  public constructor(private store$: Store<AppState>) {}

  public loadData({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: Parameters<typeof orderBookActions.load>[0]) {
    this.store$.dispatch(orderBookActions.load({ symbol, limit }));
  }

  public setOrderBook(orderBook: OrderBook) {
    this.store$.dispatch(orderBookActions.set(orderBook));
  }
}
