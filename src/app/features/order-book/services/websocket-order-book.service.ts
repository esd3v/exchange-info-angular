import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WebsocketMessagesService } from 'src/app/websocket/services/websocket-messages.service';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';
import { OrderBook } from '../models/order-book.model';
import { orderBookActions } from '../store';
import { WebsocketOrderBookStreamParams } from '../models/websocket-order-book-stream-params.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketOrderBookService {
  private _subscribed = false;

  private createStreamMessage =
    this.webSocketMessagesService.createStreamMessage<WebsocketOrderBookStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@depth20@1000ms`],
      2
    );

  public get subscribed() {
    return this._subscribed;
  }

  public set subscribed(value) {
    this._subscribed = value;
  }

  public constructor(
    private store: Store<AppState>,
    private webSocketService: WebsocketService,
    private webSocketMessagesService: WebsocketMessagesService
  ) {}

  public subscribe(params: WebsocketOrderBookStreamParams) {
    const message = this.createStreamMessage(params).subscribe;

    this.webSocketService.send(message);
  }

  public unsubscribe(params: WebsocketOrderBookStreamParams) {
    const message = this.createStreamMessage(params).unsubscribe;

    this.webSocketService.send(message);
  }

  public handleIncomingMessage({
    asks,
    bids,
    lastUpdateId,
  }: WebsocketOrderBook) {
    const orderBook: OrderBook = {
      asks,
      bids,
      lastUpdateId,
    };

    this.store.dispatch(orderBookActions.set(orderBook));
  }
}
