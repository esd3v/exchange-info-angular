import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService
  implements WithWebsocket<WebsocketCandlesStreamParams>
{
  private id = 1;

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
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.id
    );
  }

  public unsubscribe(params: WebsocketCandlesStreamParams) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.id + WEBSOCKET_UNSUBSCRIBE_BASE_ID
    );
  }
}
