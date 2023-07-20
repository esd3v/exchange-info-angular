import { Injectable } from '@angular/core';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { SetOptional } from 'type-fest';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService {
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  private createParams = ({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: SetOptional<WebsocketOrderBookStreamParams, 'limit'>) => [
    `${symbol.toLowerCase()}@depth${limit}@1000ms`,
  ];

  public subscriber = new WebsocketSubscriber(
    4,
    this.createParams,
    this.websocketSubscribeService
  );
}
