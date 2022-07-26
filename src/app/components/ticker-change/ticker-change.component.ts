import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { isPositive } from 'src/app/helpers';
import { AppState } from 'src/app/store';
import { tickerSelectors } from 'src/app/store/ticker';

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
