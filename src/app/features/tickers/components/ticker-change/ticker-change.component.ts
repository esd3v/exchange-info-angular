import { isPositive } from '../../../../shared/helpers';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent {
  public loading$ = this.store.select(tickersSelectors.loading);

  public priceChange$ = this.store
    .select(tickersSelectors.priceChange)
    .pipe(filter(Boolean));

  public positive = this.priceChange$.pipe(filter(Boolean), map(isPositive));

  public constructor(private store: Store<AppState>) {}
}
