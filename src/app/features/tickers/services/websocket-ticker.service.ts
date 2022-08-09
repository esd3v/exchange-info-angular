import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WebsocketMessagesService } from 'src/app/websocket/services/websocket-messages.service';
import { AppState } from 'src/app/store';
import { Ticker } from '../models/ticker.model';
import { WebsocketTicker } from '../models/websocket-ticker.model';
import { tickersActions } from '../store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTickerStreamParams } from '../models/websocket-ticker-stream-params.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketTickerService {
  constructor(
    private store: Store<AppState>,
    private webSocketService: WebsocketService,
    private webSocketMessagesService: WebsocketMessagesService
  ) {}

  private _subscribedIndividual = false;

  public get subscribedIndividual() {
    return this._subscribedIndividual;
  }
  public set subscribedIndividual(value) {
    this._subscribedIndividual = value;
  }

  private createIndividualStreamMessage =
    this.webSocketMessagesService.createStreamMessage<WebsocketTickerStreamParams>(
      ({ symbols }) => symbols.map((item) => `${item.toLowerCase()}@ticker`),
      1
    );

  subscribeIndividual(params: WebsocketTickerStreamParams) {
    const message = this.createIndividualStreamMessage(params).subscribe;
    this.webSocketService.send(message);
  }

  unsubscribeIndividual(params: WebsocketTickerStreamParams) {
    const message = this.createIndividualStreamMessage(params).unsubscribe;
    this.webSocketService.send(message);
  }

  handleIncomingMessage(message: WebsocketTicker) {
    const ticker: Partial<Ticker> = {
      lastPrice: message.c,
      lastQty: message.Q,
      priceChange: message.p,
      priceChangePercent: message.P,
      count: message.n,
    };

    this.store.dispatch(
      tickersActions.update({ symbol: message.s, data: ticker })
    );
  }
}
