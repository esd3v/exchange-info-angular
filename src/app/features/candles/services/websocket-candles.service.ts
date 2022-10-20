import { Candle } from './../models/candle.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WebsocketMessagesService } from 'src/app/websocket/services/websocket-messages.service';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketCandlesStreamParams } from '../models/websocket-candles-stream-params.model';
import { WebsocketCandle } from '../models/websocket-candle.model';
import { WebsocketMessageService } from 'src/app/shared/services/websocket-message.service';
import { candlesActions, candlesSelectors } from '../store';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketCandlesService extends WebsocketMessageService {
  private createStreamMessage =
    this.webSocketMessagesService.createStreamMessage<WebsocketCandlesStreamParams>(
      ({ symbol, interval }) => [`${symbol.toLowerCase()}@kline_${interval}`],
      3
    );

  public constructor(
    private store: Store<AppState>,
    private webSocketService: WebsocketService,
    private webSocketMessagesService: WebsocketMessagesService
  ) {
    super();
  }

  public subscribe(params: WebsocketCandlesStreamParams) {
    const message = this.createStreamMessage(params).subscribe;

    this.webSocketService.send(message);
  }

  public unsubscribe(params: WebsocketCandlesStreamParams) {
    const message = this.createStreamMessage(params).unsubscribe;

    this.webSocketService.send(message);
  }

  public handleIncomingMessage({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    const ohlc$ = this.store.select(candlesSelectors.ohlc);

    ohlc$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item[4]);

      if (ohlcExists) {
        this.store.dispatch(candlesActions.updateCandle({ candle }));
      } else {
        this.store.dispatch(candlesActions.addCandle({ candle }));
        this.store.dispatch(candlesActions.removeFirstCandle());
      }
    });
  }
}
