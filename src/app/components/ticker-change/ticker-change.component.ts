import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { isPositive } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(selectors.ticker.loading);
  priceChange$ = this.store.select(selectors.ticker.priceChange);
  positive = this.priceChange$.pipe(map(isPositive));
}
