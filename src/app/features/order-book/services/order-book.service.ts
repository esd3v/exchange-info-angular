import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { OrderBook } from '../models/order-book.model';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookService {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private orderBookStatus$ = this.store.select(orderBookSelectors.status);

  public constructor(
    private store: Store<AppState>,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  public onWebsocketOpen() {
    this.orderBookStatus$
      .pipe(
        first(),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        this.globalSymbol$
          .pipe(first(), filter(Boolean))
          .subscribe((symbol) => {
            this.orderBookWebsocketService.subscribeToWebsocket(
              {
                symbol,
              },
              this.orderBookWebsocketService.websocketSubscriptionId.subscribe
            );
          });
      });
  }

  public handleWebsocketData({ asks, bids, lastUpdateId }: WebsocketOrderBook) {
    const orderBook: OrderBook = {
      asks,
      bids,
      lastUpdateId,
    };

    this.store.dispatch(orderBookActions.set(orderBook));
  }
}
