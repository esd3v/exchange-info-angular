import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';

@Injectable({
  providedIn: 'root',
})
export class TickerFacade {
  public lastPrice$ = this.store$.select(tickerSelectors.lastPrice);

  public tickSize$ = this.store$.select(tickerSelectors.tickSize);

  public formattedLastPrice$ = this.store$.select(
    tickerSelectors.formattedLastPrice
  );

  public prevLastPrice$ = this.store$.select(tickerSelectors.prevLastPrice);

  public tickers$ = this.store$.select(tickerSelectors.tickers);

  public priceChange$ = this.store$.select(tickerSelectors.priceChange);

  public priceChangePercent$ = this.store$.select(
    tickerSelectors.priceChangePercent
  );

  public lastQuantity$ = this.store$.select(tickerSelectors.lastQuantity);

  public numberOfTrades$ = this.store$.select(tickerSelectors.numberOfTrades);

  public constructor(private store$: Store<AppState>) {}

  public loadData() {
    this.store$.dispatch(tickerActions.load());
  }

  public updateTicker(ticker: TickerEntity) {
    this.store$.dispatch(tickerActions.update({ data: ticker }));
  }
}
