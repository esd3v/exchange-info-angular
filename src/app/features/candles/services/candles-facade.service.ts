import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';

@Injectable({
  providedIn: 'root',
})
export class CandlesFacade {
  public interval$ = this.store$.select(candlesSelectors.interval);
  public ohlc$ = this.store$.select(candlesSelectors.ohlc);
  public dates$ = this.store$.select(candlesSelectors.dates);
  public volumes$ = this.store$.select(candlesSelectors.volumes);

  public constructor(private store$: Store<AppState>) {}

  public loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }

  public updateCandle(candle: Candle) {
    this.store$.dispatch(candlesActions.updateCandle({ candle }));
  }

  public addCandleAndRemoveFirst(candle: Candle) {
    // TODO merge functionality with removeFirstCandle, rename to addCandleAndRemoveFirst and remove removeFirstCandle
    this.store$.dispatch(candlesActions.addCandle({ candle }));
    this.store$.dispatch(candlesActions.removeFirstCandle());
  }
}
