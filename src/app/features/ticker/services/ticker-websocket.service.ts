import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketTicker } from '../types/websocket-ticker';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';
import { TickerFacade } from './ticker-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService {
  constructor(
    private tickerFacade: TickerFacade,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    this.tickerFacade.updateTicker({
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    });
  }

  createParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  singleSubscriber = new WebsocketSubscriber(
    2,
    this.createParams,
    this.websocketSubscribeService
  );

  multipleSubscriber = new WebsocketSubscriber(
    5,
    this.createParams,
    this.websocketSubscribeService
  );
}
