import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, combineLatest } from 'rxjs';
import { WebsocketCandlesService } from './features/candles/services/websocket-candles.service';
import { candlesSelectors, candlesActions } from './features/candles/store';
import {
  exchangeInfoActions,
  exchangeInfoSelectors,
} from './features/exchange-info/store';
import { WebsocketOrderBookService } from './features/order-book/services/websocket-order-book.service';
import { orderBookActions } from './features/order-book/store';
import { WebsocketTickerService } from './features/tickers/services/websocket-ticker.service';
import { tickersActions, tickersSelectors } from './features/tickers/store';
import { WebsocketTradesService } from './features/trades/services/websocket-trades.service';
import { tradesActions, tradesSelectors } from './features/trades/store';
import { SITE_NAME, WEBSOCKET_ENABLED } from './shared/config';
import { formatDecimal } from './shared/helpers';
import { AppState } from './store';
import { globalSelectors } from './store/global';
import { symbolsSelectors } from './store/symbols';
import { WebsocketMessageIncoming } from './websocket/models/websocket-message-incoming.model';
import { WebsocketService } from './websocket/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
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

  public watchCurrencyChange() {
    const currency$ = this.store.select(globalSelectors.currency);

    currency$.subscribe(() => {
      const globalPair$ = this.store.select(globalSelectors.globalPair);
      const lastPrice$ = this.store.select(tickersSelectors.lastPrice);

      combineLatest([globalPair$, lastPrice$]).subscribe(
        ([globalPair, lastPrice]) => {
          if (lastPrice) {
            const dLastPrice = formatDecimal(lastPrice);

            const title = lastPrice
              ? globalPair
                ? `${dLastPrice} | ${globalPair} | ${SITE_NAME}`
                : `${dLastPrice} | ${SITE_NAME}`
              : globalPair
              ? `${globalPair} | ${SITE_NAME}`
              : `${SITE_NAME}`;

            this.titleService.setTitle(title);
          }
        }
      );
    });
  }

  public startWebSocket() {
    if (WEBSOCKET_ENABLED) {
      this.websocketService.connect();
    }
  }

  // If we opened root without pair param
  public handleEmptyPair() {
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

  public handleWebsocketStart() {
    const websocketStatus$ = this.websocketService.status$;
    const websocketReason$ = this.websocketService.reason$;
    const tickerStatus$ = this.store.select(tickersSelectors.status);
    const tradesStatus$ = this.store.select(tradesSelectors.status);
    const candlesStatus$ = this.store.select(candlesSelectors.status);
    const exchangeInfoStatus$ = this.store.select(exchangeInfoSelectors.status);
    const candleInterval$ = this.store.select(candlesSelectors.interval);

    // Reload widgets REST data if restored
    combineLatest([websocketStatus$, websocketReason$]).subscribe(
      ([status, reason]) => {
        if (status === 'open' && reason === 'restored') {
          this.loadExchangeInfo();
          this.loadTicker();
          this.loadCandles();
          this.loadOrderBook();
          this.loadTrades();
        }
      }
    );

    combineLatest([
      websocketStatus$,
      exchangeInfoStatus$,
      tickerStatus$,
      candlesStatus$,
      tradesStatus$,
      candleInterval$,
    ]).subscribe(
      ([
        websocketStatus,
        exchangeInfoStatus,
        tickerStatus,
        candlesStatus,
        tradesStatus,
        candleInterval,
      ]) => {
        if (
          websocketStatus === 'open' &&
          exchangeInfoStatus === 'success' &&
          tickerStatus === 'success' &&
          candlesStatus === 'success' &&
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

  public handleWebsocketMessage() {
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

  public loadExchangeInfo() {
    this.store.dispatch(exchangeInfoActions.load());
  }

  public loadOrderBook() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((globalSymbol) => {
      this.store.dispatch(
        orderBookActions.load({ params: { symbol: globalSymbol, limit: 20 } })
      );
    });
  }

  public loadTicker() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe(() => {
      this.store.dispatch(tickersActions.load());
    });
  }

  public loadTrades() {
    this.globalSymbol$.pipe(filter(Boolean)).subscribe((symbol) => {
      this.store.dispatch(
        tradesActions.load({ params: { symbol, limit: 20 } })
      );
    });
  }

  public loadCandles() {
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
}