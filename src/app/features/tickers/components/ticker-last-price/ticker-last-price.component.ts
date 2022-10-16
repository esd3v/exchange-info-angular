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
  public positive: boolean | null = null;
  public loading$ = this.store.select(tickersSelectors.loading);

  public lastPrice$ = this.store
    .select(tickersSelectors.lastPrice)
    .pipe(filter(Boolean));

  public prevLastPrice$ = this.store
    .select(tickersSelectors.prevLastPrice)
    .pipe(filter(Boolean));


  public constructor(private store: Store<AppState>) {}

  public ngOnInit(): void {
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
