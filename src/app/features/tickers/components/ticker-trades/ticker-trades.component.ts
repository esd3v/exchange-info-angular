import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';

@Component({
  selector: 'app-ticker-trades',
  templateUrl: './ticker-trades.component.html',
})
export class TickerTradesComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickersSelectors.loading);
  numberOfTrades$ = this.store
    .select(tickersSelectors.numberOfTrades)
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );
}
