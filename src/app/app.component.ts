import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { combineLatest, filter } from 'rxjs';
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
import { candlesActions, candlesSelectors } from './features/candles/store';
import { orderBookActions } from './features/order-book/store';
import { WebsocketOrderBookService } from './features/order-book/services/websocket-order-book.service';
import { WebsocketCandlesService } from './features/candles/services/websocket-candles.service';
import { tradesActions, tradesSelectors } from './features/trades/store';
import { WebsocketTradesService } from './features/trades/services/websocket-trades.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private websocketService: WebsocketService,
    private websocketTickerService: WebsocketTickerService,
    private websocketOrderBookService: WebsocketOrderBookService,
    private websocketCandleService: WebsocketCandlesService,
    private websocketTradesService: WebsocketTradesService,
    private store: Store<AppState>
  ) {}

  private watchCurrencyChange() {
    const currency$ = this.store.select(globalSelectors.currency);

    currency$.subscribe(() => {
      const globalPair$ = this.store.select(globalSelectors.globalPair);
      const lastPrice$ = this.store.select(tickersSelectors.lastPrice);

      combineLatest([globalPair$, lastPrice$]).subscribe(
        ([globalPair, lastPrice]) => {
          const title = lastPrice
            ? globalPair
              ? `${formatLastPrice(lastPrice)} | ${globalPair} | ${SITE_NAME}`
              : `${formatLastPrice(lastPrice)} | ${SITE_NAME}`
            : globalPair
            ? `${globalPair} | ${SITE_NAME}`
            : `${SITE_NAME}`;

          this.titleService.setTitle(title);
        }
      );
    });
  }

  private loadExchangeInfo() {
    this.store.dispatch(exchangeInfoActions.load());
  }

  private loadOrderBook() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((globalSymbol) => {
      this.store.dispatch(
        orderBookActions.load({ params: { symbol: globalSymbol, limit: 20 } })
      );
    });
  }

  private loadTicker() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe(() => {
      this.store.dispatch(tickersActions.load());
    });
  }

  private loadTrades() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((symbol) => {
      this.store.dispatch(
        tradesActions.load({ params: { symbol, limit: 20 } })
      );
    });
  }

  private loadCandles() {
    const interval$ = this.store.select(candlesSelectors.interval);

    combineLatest([this.globalSymbol$, interval$]).subscribe(
      ([globalSymbol, interval]) => {
        if (globalSymbol) {
          this.store.dispatch(
            candlesActions.load({ params: { symbol: globalSymbol, interval } })
          );
        }
      }
    );
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
    const tradesStatus$ = this.store.select(tradesSelectors.status);
    const exchangeInfoStatus$ = this.store.select(exchangeInfoSelectors.status);
    const candleInterval$ = this.store.select(candlesSelectors.interval);
    const websocketStatus$ = this.websocketService.status$;

    websocketStatus$.subscribe((data) => {
      if (data === 'open') {
        this.loadExchangeInfo();
        this.loadTicker();
        this.loadCandles();
        this.loadOrderBook();
        this.loadTrades();
      }
    });

    combineLatest([
      exchangeInfoStatus$,
      tickerStatus$,
      candleInterval$,
      tradesStatus$,
    ]).subscribe(
      ([exchangeInfoStatus, tickerStatus, candleInterval, tradesStatus]) => {
        if (
          tickerStatus === 'success' &&
          exchangeInfoStatus === 'success' &&
          tradesStatus === 'success'
        ) {
          this.globalSymbol$.pipe(filter(Boolean)).subscribe((globalSymbol) => {
            this.websocketTickerService.subscribeIndividual({
              symbols: [globalSymbol],
            });

            this.websocketOrderBookService.subscribe({
              symbol: globalSymbol,
            });

            this.websocketCandleService.subscribe({
              symbol: globalSymbol,
              interval: candleInterval,
            });

            this.websocketTradesService.subscribe({
              symbol: globalSymbol,
            });
          });
        }
      }
    );
  }

  private handleWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      const parsed: WebsocketMessageIncoming = JSON.parse(data);

      const isOrderBook = ['lastUpdateId', 'bids', 'asks'].every((item) =>
        Object.prototype.hasOwnProperty.call(parsed, item)
      );

      if (parsed.e === '24hrTicker') {
        this.websocketTickerService.handleIncomingMessage(parsed);
      } else if (parsed.e === 'kline') {
        this.websocketCandleService.handleIncomingMessage(parsed);
      } else if (isOrderBook) {
        this.websocketOrderBookService.handleIncomingMessage(parsed);
      } else if (parsed.e === 'trade') {
        this.websocketTradesService.handleIncomingMessage(parsed);
      }
    });
  }

  public ngOnInit(): void {
    this.watchCurrencyChange();
    this.loadTicker();
    this.loadExchangeInfo();
    this.loadOrderBook();
    this.loadCandles();
    this.loadTrades();
    this.handleEmptyPair();
    this.handleWebsocketStart();
    this.handleWebsocketMessage();
  }
}
