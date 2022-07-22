import {
  lastPrice,
  prevLastPrice,
} from './../../store/ticker/ticker.selectors';
import { Store } from '@ngrx/store';
import {
  Component,
  DoCheck,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { formatLastPrice } from 'src/app/helpers';
import { AppState, selectors } from 'src/app/store';
import { filter, combineLatestWith, last, takeLast, of } from 'rxjs';

@Component({
  selector: 'app-ticker-last-price',
  templateUrl: './ticker-last-price.component.html',
})
export class TickerLastPriceComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  lastPrice: number | null = null;
  prevLastPrice: number | null = null;
  formattedLastPrice: string | number | null = null;
  positive =
    this.lastPrice === null ||
    this.prevLastPrice === null ||
    lastPrice === prevLastPrice
      ? false
      : lastPrice > prevLastPrice;

  ngOnInit(): void {
    const lastPrice$ = this.store.select(selectors.ticker.lastPrice);
    const prevLastPrice$ = this.store.select(selectors.ticker.prevLastPrice);

    lastPrice$
      .pipe(combineLatestWith(prevLastPrice$))
      .subscribe(([lastPrice, prevLastPrice]) => {
        this.lastPrice = lastPrice;
        this.prevLastPrice = prevLastPrice;

        if (lastPrice) {
          this.formattedLastPrice = formatLastPrice(lastPrice);
        }
      });
  }
}
