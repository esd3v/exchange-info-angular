import { TickerService } from './../../services/ticker.service';
import { ExchangeInfoService } from './../../services/exchange-info.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatestWith } from 'rxjs';
import { SITE_NAME } from 'src/app/config';
import { formatLastPrice } from 'src/app/helpers';
import { actions, AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private titleService: Title,
    private store: Store<AppState>,
    private tickerService: TickerService
  ) {}

  ngOnInit(): void {
    const globalSymbol$ = this.store.select(selectors.global.globalSymbol);
    const globalPair$ = this.store.select(selectors.global.globalPair);
    const lastPrice$ = this.store.select(selectors.ticker.lastPrice);

    // Set title
    globalPair$
      .pipe(combineLatestWith(lastPrice$))
      .subscribe(([globalPair, _lastPrice]) => {
        this.store.select(selectors.ticker.lastPrice).subscribe((data) => {
          const lastPrice = data;

          const title = lastPrice
            ? globalPair
              ? `${formatLastPrice(lastPrice)} | ${globalPair} | ${SITE_NAME}`
              : `${formatLastPrice(lastPrice)} | ${SITE_NAME}`
            : globalPair
            ? `${globalPair} | ${SITE_NAME}`
            : `${SITE_NAME}`;

          this.titleService.setTitle(title);
        });
      });

    globalSymbol$.subscribe((data) => {
      if (data) {
        this.tickerService.get({ symbol: data }).subscribe((data) => {
          this.store.dispatch(actions.ticker.createTicker({ payload: data }));
        });
      }
    });
  }
}
