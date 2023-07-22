import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { WebsocketOrderBookStreamParams } from '../types/websocket-order-book-stream-params';
import { OrderBookFacade } from './order-book-facade.service';

@Injectable({
  providedIn: 'root',
})
export class OrderBookWebsocketService {
  constructor(
    private orderBookFacade: OrderBookFacade,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  handleWebsocketData({ asks, bids, lastUpdateId }: WebsocketOrderBook) {
    this.orderBookFacade.setOrderBook({
      asks,
      bids,
      lastUpdateId,
    });
  }

  createParams = ({ symbol, limit }: WebsocketOrderBookStreamParams) => [
    `${symbol.toLowerCase()}@depth${limit}@1000ms`,
  ];

  subscriber = new WebsocketSubscriber(
    4,
    this.createParams,
    this.websocketSubscribeService
  );
}
