import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, first, take } from 'rxjs';
import { AppState } from 'src/app/store';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';
import { WebsocketCandle } from '../types/websocket-candle';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesFacade {
  public interval$ = this.store$.select(candlesSelectors.interval);
  public ohlc$ = this.store$.select(candlesSelectors.ohlc);
  public dates$ = this.store$.select(candlesSelectors.dates);
  public volumes$ = this.store$.select(candlesSelectors.volumes);

  public constructor(
    private globalFacade: GlobalFacade,
    private candlesWebsocketService: CandlesWebsocketService,
    private store$: Store<AppState>
  ) {}

  public unsubscribeCurrent() {
    combineLatest([
      this.interval$.pipe(first()),
      this.globalFacade.symbol$.pipe(first()),
    ]).subscribe(([currentInterval, globalSymbol]) => {
      this.candlesWebsocketService.unsubscribe({
        interval: currentInterval,
        symbol: globalSymbol,
      });
    });
  }

  public handleWebsocketData({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    const ohlc$ = this.store$.select(candlesSelectors.ohlc);

    ohlc$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item[4]);

      if (ohlcExists) {
        this.store$.dispatch(candlesActions.updateCandle({ candle }));
      } else {
        // TODO merge functionality with removeFirstCandle, rename to addCandleAndRemoveFirst and remove removeFirstCandle
        this.store$.dispatch(candlesActions.addCandle({ candle }));
        this.store$.dispatch(candlesActions.removeFirstCandle());
      }
    });
  }

  public loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }
}
