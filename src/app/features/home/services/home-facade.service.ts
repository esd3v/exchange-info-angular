import { Injectable } from '@angular/core';
import { filter, first } from 'rxjs';
import { OrderBookFacade } from '../../order-book/services/order-book-facade.service';
import { OrderBookGetParams } from '../../order-book/types/order-book-get-params';
import { WebsocketOrderBookStreamParams } from '../../order-book/types/websocket-order-book-stream-params';
import { TradesFacade } from '../../trades/services/trades-facade.service';
import { TradesGetParams } from '../../trades/types/trades-get-params';
import { WebsocketTradesStreamParams } from '../../trades/types/websocket-trades-stream-params';
import { HomeWebsocketService } from './home-websocket.service';

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  constructor(
    private homeWebsocketService: HomeWebsocketService,
    private tradesFacade: TradesFacade,
    private orderBookFacadeFacade: OrderBookFacade
  ) {}

  subscribeThenLoadData({
    orderBookParams,
    tradesParams,
  }: {
    orderBookParams: OrderBookGetParams & WebsocketOrderBookStreamParams;
    tradesParams: TradesGetParams & WebsocketTradesStreamParams;
  }) {
    this.homeWebsocketService.widgetsUpdateSubscriber.subscribe({
      orderBookParams,
      tradesParams,
    });

    this.homeWebsocketService.widgetsUpdateSubscriber.subscribeStatus$
      .pipe(
        filter((status) => status === 'done'),
        first()
      )
      .subscribe(() => {
        this.tradesFacade.loadData(tradesParams);
        this.orderBookFacadeFacade.loadData(orderBookParams);
      });
  }
}
