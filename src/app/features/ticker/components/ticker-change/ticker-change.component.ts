import { isPositive } from './../../../../shared/helpers';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickerSelectors } from 'src/app/features/ticker/store';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickerSelectors.loading);

  priceChange$ = this.store
    .select(tickerSelectors.priceChange)
    .pipe(filter(Boolean));

  positive = this.priceChange$.pipe(filter(Boolean), map(isPositive));
}
