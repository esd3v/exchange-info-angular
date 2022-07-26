import { Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/store';
import { filter, combineLatestWith } from 'rxjs';
import { tickerSelectors } from 'src/app/store/ticker';

@Component({
  selector: 'app-ticker-last-price',
  templateUrl: './ticker-last-price.component.html',
})
export class TickerLastPriceComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  loading$ = this.store.select(tickerSelectors.loading);

  lastPrice$ = this.store
    .select(tickerSelectors.lastPrice)
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
