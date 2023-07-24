import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { TradesGetParams } from '../types/trades-get-params';
import { WebsocketTrades } from '../types/websocket-trades';

@Injectable({ providedIn: 'root' })
export class TradesFacade {
  trades$ = this.store$.select(tradesSelectors.data);

  constructor(private store$: Store<AppState>) {}

  handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    this.addTrades({ price: p, qty: q, isBuyerMaker: m, time: T });
  }

  addTrades(trades: TradesEntity) {
    this.store$.dispatch(tradesActions.addAndRemoveLast(trades));
  }

  loadData({ symbol, limit = WIDGET_TRADES_DEFAULT_LIMIT }: TradesGetParams) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }
}
