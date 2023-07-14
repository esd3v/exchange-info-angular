import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  public asks$ = this.store$.select(orderBookSelectors.asks);
  public bids$ = this.store$.select(orderBookSelectors.bids);

  public constructor(
    private store$: Store<AppState>,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private globalFacade: GlobalFacade
  ) {}

  public unsubscribeCurrent() {
    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.orderBookWebsocketService.unsubscribe({ symbol });
    });
  }

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
