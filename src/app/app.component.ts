import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatestWith, filter } from 'rxjs';
import { SITE_NAME } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { tickerActions, tickerSelectors } from 'src/app/features/ticker/store';
import {
  exchangeInfoActions,
  exchangeInfoSelectors,
} from 'src/app/features/exchangeInfo/store';
import { formatLastPrice } from './shared/helpers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private store: Store<AppState>
  ) {}

  globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  globalPair$ = this.store.select(globalSelectors.globalPair);
  lastPrice$ = this.store.select(tickerSelectors.lastPrice);

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
        this.store.select(tickerSelectors.lastPrice).subscribe((data) => {
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
    this.store.dispatch(exchangeInfoActions.load());
  }

  loadTicker() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((symbol) => {
      this.store.dispatch(tickerActions.load());
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
            .select(exchangeInfoSelectors.symbols)
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
