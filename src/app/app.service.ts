import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, timer } from 'rxjs';
import { CandlesWebsocketService } from './features/candles/services/candles-websocket.service';
import { OrderBookWebsocketService } from './features/order-book/services/order-book-websocket.service';
import { TickerWebsocketService } from './features/tickers/services/ticker-websocket.service';
import { tickersSelectors } from './features/tickers/store';
import { TradesWebsocketService } from './features/trades/services/trades-websocket.service';
import {
  SITE_NAME,
  WEBSOCKET_ENABLED_AT_START,
  WEBSOCKET_START_DELAY,
} from './shared/config';
import { formatDecimal } from './shared/helpers';
import { AppState } from './store';
import { globalSelectors } from './store/global';
import { WebsocketSubscribeService } from './websocket/services/websocket-subscribe.service';
import { WebsocketService } from './websocket/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private websocketStatus$ = this.websocketService.status$;
  private websocketReason$ = this.websocketService.reason$;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private store: Store<AppState>,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private tickerWebsocketService: TickerWebsocketService,
    private tradesWebsocketService: TradesWebsocketService
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

  public watchRouterEvents() {
    this.router.events.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        // If we opened root (/) without pair param
        if (!this.route.children.length) {
          this.navigateToDefaultPair();
        }
      }
    });
  }

  private navigateToDefaultPair() {
    this.store
      .select(globalSelectors.globalPairUnderscore)
      .pipe(first(), filter(Boolean))
      .subscribe((pair) => {
        this.router.navigate([pair]);
      });
  }

  public startWebSocket() {
    if (WEBSOCKET_ENABLED_AT_START) {
      timer(WEBSOCKET_START_DELAY).subscribe(() => {
        this.websocketService.connect();
      });
    }
  }

  // App start / switch
  public watchWebsocketStatus() {
    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .subscribe(() => {
        this.websocketReason$.pipe(first()).subscribe((reason) => {
          this.candlesWebsocketService.onWebsocketOpen(reason);
          this.tickerWebsocketService.onWebsocketOpen();
          this.tradesWebsocketService.onWebsocketOpen();
          this.orderBookWebsocketService.onWebsocketOpen();
        });
      });
  }

  public watchWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      this.websocketSubscribeService.handleWebsocketMessage(data)({
        onData: (data) => {
          if ('e' in data) {
            if (data.e === 'kline') {
              this.candlesWebsocketService.handleWebsocketData(data);
            } else if (data.e === '24hrTicker') {
              this.tickerWebsocketService.handleWebsocketData(data);
            } else if (data.e === 'trade') {
              this.tradesWebsocketService.handleWebsocketData(data);
            }
          } else {
            if ('lastUpdateId' in data) {
              this.orderBookWebsocketService.handleWebsocketData(data);
            }
          }
        },
        onSubscribe(id) {
          console.log('subscribed', id);
        },
        onUnsubscribe(id) {
          console.log('unsubscribed', id);
        },
      });
    });
  }
}
