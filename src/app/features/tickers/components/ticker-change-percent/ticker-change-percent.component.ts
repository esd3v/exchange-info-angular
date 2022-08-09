import { isPositive } from '../../../../shared/helpers';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickersSelectors.loading);

  priceChangePercent$ = this.store
    .select(tickersSelectors.priceChangePercent)
    .pipe(filter(Boolean));

  positive = this.priceChangePercent$.pipe(filter(Boolean), map(isPositive));
}
