import { Injectable } from '@angular/core';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService
  implements WithWebsocket<WebsocketOrderBookStreamParams>
{
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public createParams = ({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: WebsocketOrderBookStreamParams) => [
    `${symbol.toLowerCase()}@depth${limit}@1000ms`,
  ];

  public subscribe(params: WebsocketOrderBookStreamParams) {
    this.websocketSubscribeService.subscribe(this.createParams(params));
  }

  public unsubscribe(params: WebsocketOrderBookStreamParams) {
    this.websocketSubscribeService.unsubscribe(this.createParams(params));
  }
}
