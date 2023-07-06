import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTradesStreamParams } from '../types/websocket-trades-stream-params';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService
  implements WithWebsocket<WebsocketTradesStreamParams>
{
  private id = 3;

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public createParams = ({ symbol }: WebsocketTradesStreamParams) => [
    `${symbol.toLowerCase()}@trade`,
  ];

  public subscribe(params: WebsocketTradesStreamParams) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.id
    );
  }

  public unsubscribe(params: WebsocketTradesStreamParams) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.id + WEBSOCKET_UNSUBSCRIBE_BASE_ID
    );
  }
}
