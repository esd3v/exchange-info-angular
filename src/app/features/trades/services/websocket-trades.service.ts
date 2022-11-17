import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-messages.service';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTradesStreamParams } from '../models/websocket-trades-stream-params.model';
import { WebsocketMessageService } from 'src/app/shared/services/websocket-message.service';
import { WebsocketTrades } from '../models/websocket-trades.model';
import { tradesActions } from '../store';
import { TradesEntity } from '../store/trades.state';

@Injectable({
  providedIn: 'root',
})
export class WebsocketTradesService extends WebsocketMessageService {
  private createStreamMessage =
    this.websocketSubscribeService.createStreamMessage<WebsocketTradesStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@trade`],
      4
    );

  public constructor(
    private store: Store<AppState>,
    private webSocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {
    super();
  }

  public subscribe(params: WebsocketTradesStreamParams) {
    const message = this.createStreamMessage(params).subscribe;

    this.webSocketService.send(message);
  }

  public unsubscribe(params: WebsocketTradesStreamParams) {
    const message = this.createStreamMessage(params).unsubscribe;

    this.webSocketService.send(message);
  }

  public handleIncomingMessage({ p, q, m, T }: WebsocketTrades) {
    const trades: TradesEntity = {
      price: p,
      qty: q,
      isBuyerMaker: m,
      time: T,
    };

    this.store.dispatch(tradesActions.add({ trades }));
    this.store.dispatch(tradesActions.removeLast());
  }
}
