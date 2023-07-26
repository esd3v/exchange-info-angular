import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { GlobalService } from '../../global/services/global.service';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';
import { WebsocketTicker } from '../types/websocket-ticker';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService
  ) {}

  get #globalSymbol() {
    return this.globalService.symbol;
  }

  lastPrice$ = this.store$.select(
    tickerSelectors.lastPrice(this.#globalSymbol)
  );

  tickSize$ = this.store$.select(tickerSelectors.tickSize(this.#globalSymbol));

  formattedLastPrice$ = this.store$.select(
    tickerSelectors.formattedLastPrice(this.#globalSymbol)
  );

  prevLastPrice$ = this.store$.select(
    tickerSelectors.prevLastPrice(this.#globalSymbol)
  );

  tickers$ = this.store$.select(tickerSelectors.tickers);

  priceChange$ = this.store$.select(
    tickerSelectors.priceChange(this.#globalSymbol)
  );

  priceChangePercent$ = this.store$.select(
    tickerSelectors.priceChangePercent(this.#globalSymbol)
  );

  lastQuantity$ = this.store$.select(
    tickerSelectors.lastQuantity(this.#globalSymbol)
  );

  numberOfTrades$ = this.store$.select(
    tickerSelectors.numberOfTrades(this.#globalSymbol)
  );

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
