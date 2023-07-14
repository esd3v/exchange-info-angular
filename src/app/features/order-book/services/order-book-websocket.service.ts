import { Injectable } from '@angular/core';
import { combineLatest, filter } from 'rxjs';
import { SetOptional } from 'type-fest';
import { WithWebsocket } from 'src/app/shared/with-websocket';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService
  implements WithWebsocket<WebsocketOrderBookStreamParams>
{
  private id = 4;

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

  public createParams = ({ symbol, limit }: WebsocketOrderBookStreamParams) => [
    `${symbol.toLowerCase()}@depth${limit}@1000ms`,
  ];

  public subscribe({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: SetOptional<WebsocketOrderBookStreamParams, 'limit'>) {
    this.websocketSubscribeService.subscribe(
      this.createParams({ symbol, limit }),
      this.id
    );
  }

  public unsubscribe({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: SetOptional<WebsocketOrderBookStreamParams, 'limit'>) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams({ symbol, limit }),
      this.id
    );
  }
}
