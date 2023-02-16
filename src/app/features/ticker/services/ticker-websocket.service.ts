import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService
  implements WithWebsocket<WebsocketTickerStreamParams>
{
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public createParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  public subscribe(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.subscribe(this.createParams(params));
  }

  public unsubscribe(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.unsubscribe(this.createParams(params));
  }
}
