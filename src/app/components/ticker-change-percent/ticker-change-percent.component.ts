import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { isPositive } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(selectors.ticker.loading);

  priceChangePercent$ = this.store
    .select(selectors.ticker.priceChangePercent)
    .pipe(filter(Boolean));

  positive = this.priceChangePercent$.pipe(filter(Boolean), map(isPositive));
}
