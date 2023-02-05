import { Injectable } from '@angular/core';
import {
  WEBSOCKET_UNSUBSCRIBE_BASE_ID,
  WIDGET_DEPTH_DEFAULT_LIMIT,
} from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService
  implements WithWebsocket<WebsocketOrderBookStreamParams>
{
  public websocketSubscriptionId = {
    subscribe: 4,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 4,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketOrderBookStreamParams>(
      ({ symbol, limit = WIDGET_DEPTH_DEFAULT_LIMIT }) => [
        `${symbol.toLowerCase()}@depth${limit}@1000ms`,
      ]
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
