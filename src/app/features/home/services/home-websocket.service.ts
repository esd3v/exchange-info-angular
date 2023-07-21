import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { CandlesWebsocketService } from '../../candles/services/candles-websocket.service';
import { WebsocketCandlesStreamParams } from '../../candles/types/websocket-candles-stream-params';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { WebsocketOrderBookStreamParams } from '../../order-book/types/websocket-order-book-stream-params';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { WebsocketTradesStreamParams } from '../../trades/types/websocket-trades-stream-params';

@Injectable({
  providedIn: 'root',
})
export class HomeWebsocketService {
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService,
    private candlesWebsocketService: CandlesWebsocketService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public createParams({
    candlesParams,
    orderBookParams,
    tradesParams,
  }: {
    candlesParams: WebsocketCandlesStreamParams;
    orderBookParams: WebsocketOrderBookStreamParams;
    tradesParams: WebsocketTradesStreamParams;
  }) {
    const combined = [
      this.candlesWebsocketService.createParams(candlesParams),
      this.orderBookWebsocketService.createParams(orderBookParams),
      this.tradesWebsocketService.createParams(tradesParams),
    ].reduce((prev, current) => [...prev, ...current], []);

    return combined;
  }

  public widgetsUpdateSubscriber = new WebsocketSubscriber(
    6,
    this.createParams.bind(this),
    this.websocketSubscribeService
  );
}
