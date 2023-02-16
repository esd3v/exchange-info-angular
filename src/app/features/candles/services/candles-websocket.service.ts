import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService
  implements WithWebsocket<WebsocketCandlesStreamParams>
{
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public createParams = ({
    symbol,
    interval,
  }: WebsocketCandlesStreamParams) => [
    `${symbol.toLowerCase()}@kline_${interval}`,
  ];

  public subscribe(params: WebsocketCandlesStreamParams) {
    this.websocketSubscribeService.subscribe(this.createParams(params));
  }

  public unsubscribe(params: WebsocketCandlesStreamParams) {
    this.websocketSubscribeService.unsubscribe(this.createParams(params));
  }
}
