import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService
  implements WithWebsocket<WebsocketTickerStreamParams>
{
  private _singleId = 2;
  private _pairsId = 5;

  public subscribeStatusSingle$ =
    this.websocketSubscribeService.subscribeStatusById$(this._singleId);

  public unsubscribeStatusSingle$ =
    this.websocketSubscribeService.unsubscribeStatusById$(this._singleId);

  public subscribeStatusPairs$ =
    this.websocketSubscribeService.subscribeStatusById$(this._pairsId);

  public unsubscribeStatusPairs$ =
    this.websocketSubscribeService.unsubscribeStatusById$(this._pairsId);

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

  public subscribe(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.singleId
    );
  }

  public unsubscribe(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.singleId
    );
  }

  public subscribePairs(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.pairsId
    );
  }

  public unsubscribePairs(params: WebsocketTickerStreamParams) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.pairsId
    );
  }
}
