import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';

@Injectable({
  providedIn: 'root',
})
export class CandlesFacade {
  interval$ = this.store$.select(candlesSelectors.interval);

  ohlc$ = this.store$.select(candlesSelectors.ohlc);

  dates$ = this.store$.select(candlesSelectors.dates);

  volumes$ = this.store$.select(candlesSelectors.volumes);

  constructor(private store$: Store<AppState>) {}

  loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }

  updateCandle(candle: Candle) {
    this.store$.dispatch(candlesActions.updateCandle({ candle }));
  }

  addCandleAndRemoveFirst(candle: Candle) {
    this.store$.dispatch(candlesActions.addCandleAndRemoveFirst({ candle }));
  }
}
