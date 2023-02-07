import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { combineLatest, timer } from 'rxjs';
import { CandlesService } from './features/candles/services/candles.service';
import { OrderBookService } from './features/order-book/services/order-book.service';
import { PairsService } from './features/pairs/services/pairs.service';
import { TickerService } from './features/tickers/services/ticker.service';
import { TradesService } from './features/trades/services/trades.service';
import {
  APP_SITE_NAME,
  WEBSOCKET_ENABLED_AT_START,
  WEBSOCKET_START_DELAY,
} from './shared/config';
import { formatDecimal } from './shared/helpers';
import { GlobalService } from './features/global/services/global.service';
import { WebsocketSubscribeService } from './websocket/services/websocket-subscribe.service';
import { WebsocketService } from './websocket/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public constructor(
    private titleService: Title,
    private globalService: GlobalService,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private orderBookService: OrderBookService,
    private tradesService: TradesService,
    private candlesService: CandlesService,
    private tickerService: TickerService,
    private pairsService: PairsService
  ) {}

  public setTitle() {
    combineLatest([
      this.globalService.globalPair$,
      this.tickerService.lastPrice$,
    ]).subscribe(([globalPair, lastPrice]) => {
      const title = lastPrice
        ? globalPair
          ? `${formatDecimal(lastPrice)} | ${globalPair} | ${APP_SITE_NAME}`
          : `${formatDecimal(lastPrice)} | ${APP_SITE_NAME}`
        : globalPair
        ? `${globalPair} | ${APP_SITE_NAME}`
        : `${APP_SITE_NAME}`;

      this.titleService.setTitle(title);
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
    this.pairsService.onWebsocketOpen();
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
