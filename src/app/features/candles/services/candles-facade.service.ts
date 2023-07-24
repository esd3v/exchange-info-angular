import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';
import { CandlesGetParams } from '../types/candles-get-params';
import { CandlesWebsocketService } from './candles-websocket.service';
import { filter, first, take } from 'rxjs';
import { WebsocketCandle } from '../types/websocket-candle';

@Injectable({
  providedIn: 'root',
})
export class CandlesFacade {
  interval$ = this.store$.select(candlesSelectors.interval);

  candles$ = this.store$.select(candlesSelectors.candles);

  constructor(
    private store$: Store<AppState>,
    private candlesWebsocketService: CandlesWebsocketService
  ) {}

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

  subscribeThenLoadData({
    symbol,
    interval,
  }: Parameters<typeof candlesActions.load>[0]) {
    this.candlesWebsocketService.subscriber.subscribe({ symbol, interval });

    this.candlesWebsocketService.subscriber.subscribeStatus$
      .pipe(
        filter((status) => status === 'done'),
        first()
      )
      .subscribe(() => {
        this.loadData({ symbol, interval });
      });
  }
}
