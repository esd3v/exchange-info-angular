import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';
import { AppState } from 'src/app/store';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';
import { WebsocketCandle } from '../types/websocket-candle';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';
import { CandleInterval } from '../types/candle-interval';

@Injectable({
  providedIn: 'root',
})
export class CandlesService {
  constructor(private store$: Store<AppState>) {}

  interval$ = this.store$.select(candlesSelectors.interval);

  candles$ = this.store$.select(candlesSelectors.candles);

  createStreamParams = ({ symbol, interval }: WebsocketCandlesStreamParams) => [
    `${symbol.toLowerCase()}@kline_${interval}`,
  ];

  setInterval(interval: CandleInterval) {
    this.store$.dispatch(candlesActions.setInterval({ interval }));
  }

  loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }

  updateCandle(candle: Candle) {
    this.store$.dispatch(candlesActions.updateCandle({ candle }));
  }

  addCandleAndRemoveFirst(candle: Candle) {
    this.store$.dispatch(candlesActions.addCandleAndRemoveFirst({ candle }));
  }

  handleWebsocketData({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    this.candles$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item.openTime);

      if (ohlcExists) {
        this.updateCandle(candle);
      } else {
        this.addCandleAndRemoveFirst(candle);
      }
    });
  }
}
