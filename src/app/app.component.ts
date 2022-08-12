import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatest, combineLatestWith, filter } from 'rxjs';
import { SITE_NAME } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import {
  tickersActions,
  tickersSelectors,
} from 'src/app/features/tickers/store';
import { symbolsSelectors } from 'src/app/store/symbols';
import { formatLastPrice } from './shared/helpers';
import { WebsocketMessageIncoming } from './websocket/models/websocket-message-incoming.model';
import { WebsocketTickerService } from './features/tickers/services/websocket-ticker.service';
import { WebsocketService } from './websocket/services/websocket.service';
import {
  exchangeInfoActions,
  exchangeInfoSelectors,
} from './features/exchange-info/store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private websocketService: WebsocketService,
    private websocketTickerService: WebsocketTickerService,
    private store: Store<AppState>
  ) {}

  public ngOnInit(): void {
    this.setTitle();
    this.loadTicker();
    this.loadExchangeInfo();
    this.handleEmptyPair();
    this.handleWebsocketStart();
    this.handleWebsocketMessage();
  }

  private setTitle() {
    const lastPrice$ = this.store.select(tickersSelectors.lastPrice);
    const globalPair$ = this.store.select(globalSelectors.globalPair);

    globalPair$
      .pipe(combineLatestWith(lastPrice$))
      .subscribe(([globalPair, _lastPrice]) => {
        this.store.select(tickersSelectors.lastPrice).subscribe((data) => {
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

  private loadExchangeInfo() {
    this.store.dispatch(exchangeInfoActions.load());
  }

  private loadTicker() {
    const globalSymbol$ = this.store.select(globalSelectors.globalSymbol);

    globalSymbol$.pipe(filter(Boolean)).subscribe(() => {
      this.store.dispatch(tickersActions.load());
    });
  }

  // If we opened root without pair param
  private handleEmptyPair() {
    this.router.events.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        // If root (/)
        if (!this.route.children.length) {
          this.store
            .select(symbolsSelectors.allSymbols)
            .pipe(filter(Boolean))
            .subscribe((data) => {
              const firstSymbol = data[0];

              console.log('data', data);

              if (firstSymbol) {
                const { baseAsset, quoteAsset } = firstSymbol;
                const pair = `${baseAsset}_${quoteAsset}`;

                // Get currency of first symbol and nagivate
                this.router.navigate([pair]);
              }
            });
        }
      }
    });
  }

  private handleWebsocketStart() {
    const tickerStatus$ = this.store.select(tickersSelectors.status);
    const exchangeInfoStatus$ = this.store.select(exchangeInfoSelectors.status);
    const websocketStatus$ = this.websocketService.status$;

    combineLatest([
      websocketStatus$,
      exchangeInfoStatus$,
      tickerStatus$,
    ]).subscribe(([websocketStatus, exchangeInfoStatus, tickerStatus]) => {
      if (
        websocketStatus === 'open' &&
        tickerStatus === 'success' &&
        exchangeInfoStatus === 'success'
      ) {
        this.store
          .select(globalSelectors.globalSymbol)
          .pipe(filter(Boolean))
          .subscribe((globalSymbol) => {
            this.websocketTickerService.subscribeIndividual({
              symbols: [globalSymbol],
            });
          });
      }
    });
  }

  private handleWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      const parsed: WebsocketMessageIncoming = JSON.parse(data);

      if (parsed.e === '24hrTicker') {
        this.websocketTickerService.handleIncomingMessage(parsed);
      }
    });
  }
}
