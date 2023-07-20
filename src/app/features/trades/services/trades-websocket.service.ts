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
  public constructor(
    private tradesFacade: TradesFacade,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    this.tradesFacade.addTrades({ price: p, qty: q, isBuyerMaker: m, time: T });
  }

  private createParams = ({ symbol }: WebsocketTradesStreamParams) => [
    `${symbol.toLowerCase()}@trade`,
  ];

  public subscriber = new WebsocketSubscriber(
    3,
    this.createParams,
    this.websocketSubscribeService
  );
}
