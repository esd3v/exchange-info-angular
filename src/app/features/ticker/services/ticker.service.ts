import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';
import { WebsocketTicker } from '../types/websocket-ticker';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  lastPrice$ = this.store$.select(tickerSelectors.lastPrice);

  tickSize$ = this.store$.select(tickerSelectors.tickSize);

  formattedLastPrice$ = this.store$.select(tickerSelectors.formattedLastPrice);

  prevLastPrice$ = this.store$.select(tickerSelectors.prevLastPrice);

  tickers$ = this.store$.select(tickerSelectors.tickers);

  priceChange$ = this.store$.select(tickerSelectors.priceChange);

  priceChangePercent$ = this.store$.select(tickerSelectors.priceChangePercent);

  lastQuantity$ = this.store$.select(tickerSelectors.lastQuantity);

  numberOfTrades$ = this.store$.select(tickerSelectors.numberOfTrades);

  constructor(private store$: Store<AppState>) {}

  handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    this.updateTicker({
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    });
  }

  loadData() {
    this.store$.dispatch(tickerActions.load());
  }

  updateTicker(ticker: TickerEntity) {
    this.store$.dispatch(tickerActions.update({ data: ticker }));
  }
}
