import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { isPositive } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  priceChange$ = this.store.select(selectors.ticker.priceChange);
  positive = this.priceChange$.pipe(map(isPositive));

  ngOnInit(): void {}
}
