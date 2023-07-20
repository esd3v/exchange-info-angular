import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';

@Injectable({ providedIn: 'root' })
export class TradesFacade {
  public restStatus$ = this.store$.select(tradesSelectors.status);
  public trades$ = this.store$.select(tradesSelectors.data);

  public constructor(private store$: Store<AppState>) {}

  public loadData({
    symbol,
    limit = WIDGET_TRADES_DEFAULT_LIMIT,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }

  public addTrades(trades: TradesEntity) {
    this.store$.dispatch(
      tradesActions.addAndRemoveLast({
        trades,
      })
    );
  }
}
