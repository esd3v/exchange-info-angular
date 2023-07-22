import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { WebsocketOrderBookStreamParams } from '../../order-book/types/websocket-order-book-stream-params';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { WebsocketTradesStreamParams } from '../../trades/types/websocket-trades-stream-params';

@Injectable({
  providedIn: 'root',
})
export class HomeWebsocketService {
  constructor(
    private websocketSubscribeService: WebsocketSubscribeService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  createParams({
    orderBookParams,
    tradesParams,
  }: {
    orderBookParams: WebsocketOrderBookStreamParams;
    tradesParams: WebsocketTradesStreamParams;
  }) {
    // Don't include candle because we need manage interval change separately
    const combined = [
      this.orderBookWebsocketService.createParams(orderBookParams),
      this.tradesWebsocketService.createParams(tradesParams),
    ].reduce((prev, current) => [...prev, ...current], []);

    return combined;
  }

  widgetsUpdateSubscriber = new WebsocketSubscriber(
    6,
    this.createParams.bind(this),
    this.websocketSubscribeService
  );
}
