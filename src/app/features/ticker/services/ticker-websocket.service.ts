import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService
  implements WithWebsocket<WebsocketTickerStreamParams>
{
  private _singleId = 2;
  private _pairsId = 5;

  public get singleId() {
    return this._singleId;
  }

  public get pairsId() {
    return this._pairsId;
  }

  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public createParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  public subscribe(params: WebsocketTickerStreamParams, customId: number) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      customId
    );
  }

  public unsubscribe(params: WebsocketTickerStreamParams, customId: number) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      customId + WEBSOCKET_UNSUBSCRIBE_BASE_ID
    );
  }
}
