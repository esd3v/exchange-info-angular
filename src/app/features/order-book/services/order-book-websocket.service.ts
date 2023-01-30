import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketOrderBookStreamParams } from '../models/websocket-order-book-stream-params.model';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService
  implements WithWebsocket<WebsocketOrderBookStreamParams, WebsocketOrderBook>
{
  public websocketSubscriptionId = {
    subscribe: 4,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 4,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketOrderBookStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@depth20@1000ms`]
    );

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

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
