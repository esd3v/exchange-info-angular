import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService
  implements WithWebsocket<WebsocketTickerStreamParams>
{
  public websocketSubscriptionId = {
    subscribe: {
      single: 1,
      multiple: 2,
    },
    unsubscribe: {
      single: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 1,
      multiple: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 2,
    },
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketTickerStreamParams>(
      ({ symbols }) => symbols.map((item) => `${item.toLowerCase()}@ticker`)
    );

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public subscribeToWebsocket(params: WebsocketTickerStreamParams, id: number) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketTickerStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
