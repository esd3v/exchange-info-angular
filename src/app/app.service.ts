import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { combineLatest, timer } from 'rxjs';
import { CandlesFacade } from './features/candles/services/candles-facade.service';
import { GlobalFacade } from './features/global/services/global-facade.service';
import { OrderBookFacade } from './features/order-book/services/order-book-facade.service';
import { PairsService } from './features/pairs/services/pairs.service';
import { TickerFacade } from './features/ticker/services/ticker-facade.service';
import { TradesFacade } from './features/trades/services/trades-facade.service';
import { APP_SITE_NAME, WEBSOCKET_START_DELAY } from './shared/config';
import { formatPrice } from './shared/helpers';
import { WebsocketSubscribeService } from './websocket/services/websocket-subscribe.service';
import { WebsocketService } from './websocket/services/websocket.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  public constructor(
    private titleService: Title,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private orderBookFacade: OrderBookFacade,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private tickerFacade: TickerFacade,
    private pairsService: PairsService
  ) {}

  public setTitle() {
    combineLatest([
      this.globalFacade.globalPair$,
      this.tickerFacade.lastPrice$,
      this.tickerFacade.tickSize$,
    ]).subscribe(([globalPair, lastPrice, tickSize]) => {
      const delimiter = ' | ';

      const pricePart =
        lastPrice && tickSize
          ? `${formatPrice(lastPrice, tickSize)}${delimiter}`
          : '';

      const globalPairPart = globalPair ? `${globalPair}${delimiter}` : '';
      const title = `${pricePart}${globalPairPart}${APP_SITE_NAME}`;

      this.titleService.setTitle(title);
    });
  }

  public startWebSocket() {
    timer(WEBSOCKET_START_DELAY).subscribe(() => {
      this.websocketService.connect();
    });
  }

  // App start / switch
  public onWebsocketOpen() {
    this.websocketService.open$.subscribe(() => {
      this.candlesFacade.onWebsocketOpen();
      this.tickerFacade.onWebsocketOpen();
      this.tradesFacade.onWebsocketOpen();
      this.orderBookFacade.onWebsocketOpen();
      this.pairsService.onWebsocketOpen();
    });
  }

  public onWebsocketMessage() {
    this.websocketService.messages$.subscribe(({ data }) => {
      this.websocketSubscribeService.handleWebsocketMessage(data)({
        onData: (data) => {
          if ('e' in data) {
            if (data.e === 'kline') {
              this.candlesFacade.handleWebsocketData(data);
            } else if (data.e === '24hrTicker') {
              this.tickerFacade.handleWebsocketData(data);
            } else if (data.e === 'trade') {
              this.tradesFacade.handleWebsocketData(data);
            }
          } else {
            if ('lastUpdateId' in data) {
              this.orderBookFacade.handleWebsocketData(data);
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
