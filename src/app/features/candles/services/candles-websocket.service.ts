import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { Candle } from '../types/candle';
import { WebsocketCandle } from '../types/websocket-candle';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';
import { CandlesFacade } from './candles-facade.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService {
  constructor(
    private candlesFacade: CandlesFacade,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  handleWebsocketData({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    this.candlesFacade.candles$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item.openTime);

      if (ohlcExists) {
        this.candlesFacade.updateCandle(candle);
      } else {
        this.candlesFacade.addCandleAndRemoveFirst(candle);
      }
    });
  }

  createParams = ({ symbol, interval }: WebsocketCandlesStreamParams) => [
    `${symbol.toLowerCase()}@kline_${interval}`,
  ];

  subscriber = new WebsocketSubscriber(
    1,
    this.createParams,
    this.websocketSubscribeService
  );
}
