import { filter, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AppState } from 'src/app/store';
import { tickerSelectors } from 'src/app/features/ticker/store';

@Component({
  selector: 'app-ticker-last-quantity',
  templateUrl: './ticker-last-quantity.component.html',
})
export class TickerLastQuantityComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickerSelectors.loading);
  lastQuantity$ = this.store
    .select(tickerSelectors.lastQuantity)
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );
}
