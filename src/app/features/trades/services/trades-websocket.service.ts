import { Injectable } from '@angular/core';
import { WithWebsocket } from 'src/app/shared/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTradesStreamParams } from '../types/websocket-trades-stream-params';
import { combineLatest, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService
  implements WithWebsocket<WebsocketTradesStreamParams>
{
  private id = 3;

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
      this.id
    );
  }

  public unsubscribeCurrent() {
    this.websocketSubscribeService.unsubscribeCurrent(this.id);
  }
}
