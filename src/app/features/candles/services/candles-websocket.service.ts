import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';
import { combineLatest, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService
  implements WithWebsocket<WebsocketCandlesStreamParams>
{
  private id = 1;

  public subscribeStatus$ = this.websocketSubscribeService.subscribeStatusById$(
    this.id
  );

  public unsubscribeStatus$ =
    this.websocketSubscribeService.unsubscribeStatusById$(this.id);

  public resubscribed$ = combineLatest([
    this.unsubscribeStatus$.pipe(filter((status) => status === 'done')),
    this.subscribeStatus$.pipe(filter((status) => status === 'done')),
  ]);

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
      this.id
    );
  }

  public unsubscribeCurrent() {
    this.websocketSubscribeService.unsubscribeCurrent(this.id);
  }
}
