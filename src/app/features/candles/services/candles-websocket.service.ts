import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../models/websocket-candles-stream-params.model';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService
  implements WithWebsocket<WebsocketCandlesStreamParams>
{
  public websocketSubscriptionId = {
    subscribe: 5,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 5,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketCandlesStreamParams>(
      ({ symbol, interval }) => [`${symbol.toLowerCase()}@kline_${interval}`]
    );

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public subscribeToWebsocket(
    params: WebsocketCandlesStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketCandlesStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
