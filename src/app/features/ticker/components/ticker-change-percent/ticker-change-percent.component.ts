import { isPositive } from './../../../../shared/helpers';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickerSelectors } from 'src/app/features/ticker/store';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickerSelectors.loading);

  priceChangePercent$ = this.store
    .select(tickerSelectors.priceChangePercent)
    .pipe(filter(Boolean));

  positive = this.priceChangePercent$.pipe(filter(Boolean), map(isPositive));
}