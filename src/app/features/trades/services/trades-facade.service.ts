import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';

@Injectable({ providedIn: 'root' })
export class TradesFacade {
  trades$ = this.store$.select(tradesSelectors.data);

  constructor(private store$: Store<AppState>) {}

  loadData({
    symbol,
    limit = WIDGET_TRADES_DEFAULT_LIMIT,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }

  addTrades(trades: TradesEntity) {
    this.store$.dispatch(tradesActions.addAndRemoveLast(trades));
  }
}
