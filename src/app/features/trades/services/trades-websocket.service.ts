import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketTrades } from '../types/websocket-trades';
import { WebsocketTradesStreamParams } from '../types/websocket-trades-stream-params';
import { TradesFacade } from './trades-facade.service';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService {
  constructor(
    private tradesFacade: TradesFacade,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    this.tradesFacade.addTrades({ price: p, qty: q, isBuyerMaker: m, time: T });
  }

  createParams = ({ symbol }: WebsocketTradesStreamParams) => [
    `${symbol.toLowerCase()}@trade`,
  ];

  subscriber = new WebsocketSubscriber(
    3,
    this.createParams,
    this.websocketSubscribeService
  );
}
