import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WebsocketMessagesService } from 'src/app/websocket/services/websocket-messages.service';
import { AppState } from 'src/app/store';
import { WebsocketTicker } from '../models/websocket-ticker.model';
import { tickersActions } from '../store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTickerStreamParams } from '../models/websocket-ticker-stream-params.model';
import { TickerEntity } from '../store/tickers.state';

@Injectable({
  providedIn: 'root',
})
export class WebsocketTickerService {
  private _subscribedIndividual = false;

  private createIndividualStreamMessage =
    this.webSocketMessagesService.createStreamMessage<WebsocketTickerStreamParams>(
      ({ symbols }) => symbols.map((item) => `${item.toLowerCase()}@ticker`),
      1
    );

  public get subscribedIndividual() {
    return this._subscribedIndividual;
  }

  public set subscribedIndividual(value) {
    this._subscribedIndividual = value;
  }

  public constructor(
    private store: Store<AppState>,
    private webSocketService: WebsocketService,
    private webSocketMessagesService: WebsocketMessagesService
  ) {}

  public subscribeIndividual(params: WebsocketTickerStreamParams) {
    const message = this.createIndividualStreamMessage(params).subscribe;

    this.webSocketService.send(message);
  }

  public unsubscribeIndividual(params: WebsocketTickerStreamParams) {
    const message = this.createIndividualStreamMessage(params).unsubscribe;

    this.webSocketService.send(message);
  }

  public handleIncomingMessage(message: WebsocketTicker) {
    const ticker: TickerEntity = {
      symbol: message.s,
      lastPrice: message.c,
      lastQty: message.Q,
      priceChange: message.p,
      priceChangePercent: message.P,
      count: message.n,
    };

    this.store.dispatch(tickersActions.update({ data: ticker }));
  }
}
