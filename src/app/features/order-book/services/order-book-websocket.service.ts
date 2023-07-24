import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService {
  constructor(private websocketSubscribeService: WebsocketSubscribeService) {}

  createParams = ({ symbol, limit }: WebsocketOrderBookStreamParams) => [
    `${symbol.toLowerCase()}@depth${limit}@1000ms`,
  ];

  subscriber = new WebsocketSubscriber(
    4,
    this.createParams,
    this.websocketSubscribeService
  );
}
