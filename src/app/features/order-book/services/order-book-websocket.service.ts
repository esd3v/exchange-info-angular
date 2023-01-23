import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { OrderBook } from '../models/order-book.model';
import { WebsocketOrderBookStreamParams } from '../models/websocket-order-book-stream-params.model';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';
import { orderBookActions, orderBookSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService
  implements WithWebsocket<WebsocketOrderBookStreamParams, WebsocketOrderBook>
{
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private orderBookStatus$ = this.store.select(orderBookSelectors.status);

  public websocketSubscriptionId = {
    subscribe: 4,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 4,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketOrderBookStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@depth20@1000ms`]
    );

  public constructor(
    private store: Store<AppState>,
    private websocketSubscribeService: WebsocketSubscribeService
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
            this.subscribeToWebsocket(
              {
                symbol,
              },
              this.websocketSubscriptionId.subscribe
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

  public subscribeToWebsocket(
    params: WebsocketOrderBookStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketOrderBookStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
