import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { isPositive } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  constructor(private store: Store<AppState>) {}

  priceChangePercent$ = this.store.select(selectors.ticker.priceChangePercent);
  positive = this.priceChangePercent$.pipe(map(isPositive));
}
