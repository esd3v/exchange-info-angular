import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, timer } from 'rxjs';
import { CandlesService } from './features/candles/services/candles.service';
import { OrderBookService } from './features/order-book/services/order-book.service';
import { TickerService } from './features/tickers/services/ticker.service';
import { tickersSelectors } from './features/tickers/store';
import { TradesService } from './features/trades/services/trades.service';
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
  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private store: Store<AppState>,
    private orderBookService: OrderBookService,
    private tradesService: TradesService,
    private candlesService: CandlesService,
    private tickerService: TickerService
  ) {}

  public setLastTitle() {
    const globalPair$ = this.store.select(globalSelectors.globalPair);
    const lastPrice$ = this.store.select(tickersSelectors.lastPrice);

    combineLatest([globalPair$, lastPrice$]).subscribe(
      ([globalPair, lastPrice]) => {
        const title = lastPrice
          ? globalPair
            ? `${formatDecimal(lastPrice)} | ${globalPair} | ${SITE_NAME}`
            : `${formatDecimal(lastPrice)} | ${SITE_NAME}`
          : globalPair
          ? `${globalPair} | ${SITE_NAME}`
          : `${SITE_NAME}`;

        this.titleService.setTitle(title);
      }
    );
  }

  public onRouteEvent() {
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
  public onWebsocketOpen() {
    this.candlesService.onWebsocketOpen();
    this.tickerService.onWebsocketOpen();
    this.tradesService.onWebsocketOpen();
    this.orderBookService.onWebsocketOpen();
  }

  public onWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      this.websocketSubscribeService.handleWebsocketMessage(data)({
        onData: (data) => {
          if ('e' in data) {
            if (data.e === 'kline') {
              this.candlesService.handleWebsocketData(data);
            } else if (data.e === '24hrTicker') {
              this.tickerService.handleWebsocketData(data);
            } else if (data.e === 'trade') {
              this.tradesService.handleWebsocketData(data);
            }
          } else {
            if ('lastUpdateId' in data) {
              this.orderBookService.handleWebsocketData(data);
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
