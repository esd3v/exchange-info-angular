import { filter, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { Component } from '@angular/core';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';

@Component({
  selector: 'app-ticker-last-quantity',
  templateUrl: './ticker-last-quantity.component.html',
})
export class TickerLastQuantityComponent {
  public loading$ = this.store$.select(tickersSelectors.loading);
  public lastQuantity$ = this.store$
    .select(tickersSelectors.lastQuantity)
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );

  public constructor(private store$: Store<AppState>) {}
}
