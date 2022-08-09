import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/store';
import { filter, combineLatestWith } from 'rxjs';
import { tickersSelectors } from 'src/app/features/tickers/store';

@Component({
  selector: 'app-ticker-last-price',
  templateUrl: './ticker-last-price.component.html',
})
export class TickerLastPriceComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickersSelectors.loading);

  lastPrice$ = this.store
    .select(tickersSelectors.lastPrice)
    .pipe(filter(Boolean));

  prevLastPrice$ = this.lastPrice$; // TODO Update
  positive: boolean | null = null;

  ngOnInit(): void {
    this.lastPrice$
      .pipe(combineLatestWith(this.prevLastPrice$))
      .subscribe(([lastPrice, prevLastPrice]) => {
        if (lastPrice && prevLastPrice) {
          if (Number(lastPrice) > Number(prevLastPrice)) {
            this.positive = true;
          } else if (Number(lastPrice) < Number(prevLastPrice)) {
            this.positive = false;
          }
        }
      });
  }
}
