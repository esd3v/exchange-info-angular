import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-trades',
  templateUrl: './ticker-trades.component.html',
})
export class TickerTradesComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(selectors.ticker.loading);
  numberOfTrades$ = this.store
    .select(selectors.ticker.numberOfTrades)
    .pipe(map(Number));
}
