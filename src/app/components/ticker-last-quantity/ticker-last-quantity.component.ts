import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-last-quantity',
  templateUrl: './ticker-last-quantity.component.html',
})
export class TickerLastQuantityComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(selectors.ticker.loading);
  lastQuantity$ = this.store
    .select(selectors.ticker.lastQuantity)
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(map((data) => data && Number(data)));
}
