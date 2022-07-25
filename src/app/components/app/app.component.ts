import { ActivatedRoute, Router } from '@angular/router';
import { TickerService } from './../../services/ticker.service';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatestWith, filter } from 'rxjs';
import { SITE_NAME } from 'src/app/config';
import { formatLastPrice } from 'src/app/helpers';
import { actions, AppState, selectors } from 'src/app/store';
import { ExchangeInfoService } from 'src/app/services/exchange-info.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private store: Store<AppState>,
    private tickerService: TickerService,
    private exchangeInfoService: ExchangeInfoService
  ) {}

  globalSymbol$ = this.store.select(selectors.global.globalSymbol);
  globalPair$ = this.store.select(selectors.global.globalPair);
  lastPrice$ = this.store.select(selectors.ticker.lastPrice);

  ngOnInit(): void {
    this.setTitle();
    this.loadTicker();
    this.loadExchangeInfo();
    this.handleEmptyPair();
  }

  setTitle() {
    this.globalPair$
      .pipe(combineLatestWith(this.lastPrice$))
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
  }

  loadExchangeInfo() {
    this.store.dispatch(actions.exchangeInfo.load());
  }

  loadTicker() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((symbol) => {
      this.store.dispatch(actions.ticker.load());
    });
  }

  // If we opened root without pair param
  handleEmptyPair() {
    this.router.events.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        // If root (/)
        if (!this.route.children.length) {
          this.store
            .select(selectors.exchangeInfo.symbols)
            .pipe(filter(Boolean))
            .subscribe((data) => {
              const { baseAsset, quoteAsset } = data[0];
              const pair = `${baseAsset}_${quoteAsset}`;

              // Get currency of first symbol and nagivate
              this.router.navigate([pair]);
            });
        }
      }
    });
  }
}
