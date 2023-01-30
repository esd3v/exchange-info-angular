import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTradesStreamParams } from '../models/websocket-trades-stream-params.model';
import { WebsocketTrades } from '../models/websocket-trades.model';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService
  implements WithWebsocket<WebsocketTradesStreamParams, WebsocketTrades>
{
  public websocketSubscriptionId = {
    subscribe: 3,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 3,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketTradesStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@trade`]
    );

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public subscribeToWebsocket(params: WebsocketTradesStreamParams, id: number) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketTradesStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
