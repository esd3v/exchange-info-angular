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

  lastPrice$ = this.store.select(selectors.ticker.lastPrice);
  prevLastPrice$ = this.store.select(selectors.ticker.prevLastPrice);
  positive: boolean = true;

  ngOnInit(): void {
    this.lastPrice$
      .pipe(combineLatestWith(this.prevLastPrice$))
      .subscribe(([lastPrice, prevLastPrice]) => {
        this.positive =
          lastPrice === null ||
          prevLastPrice === null ||
          lastPrice === prevLastPrice
            ? false
            : lastPrice > prevLastPrice;
      });
  }
}
