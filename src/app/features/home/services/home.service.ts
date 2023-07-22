import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { combineLatest, filter, first, switchMap } from 'rxjs';
import {
  APP_SITE_NAME,
  WIDGET_DEPTH_DEFAULT_LIMIT,
} from 'src/app/shared/config';
import { formatPrice } from 'src/app/shared/helpers';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesWebsocketService } from '../../candles/services/candles-websocket.service';
import { ExchangeInfoFacade } from '../../exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { TickerFacade } from '../../ticker/services/ticker-facade.service';
import { TickerWebsocketService } from '../../ticker/services/ticker-websocket.service';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { HomeWebsocketService } from './home-websocket.service';

@Injectable({ providedIn: 'root' })
export class HomerService {
  constructor(
    private globalFacade: GlobalFacade,
    private router: Router,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private titleService: Title,
    private websocketService: WebsocketService,
    private tickerFacade: TickerFacade,
    private tickerWebsocketService: TickerWebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tradesWebsocketService: TradesWebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private homeWebsocketService: HomeWebsocketService
  ) {}

  #createTitle({
    lastPrice,
    pair,
    tickSize,
  }: {
    lastPrice: string | undefined;
    tickSize: string | undefined;
    pair: string;
  }) {
    const delimiter = ' | ';

    const pricePart =
      lastPrice && tickSize
        ? `${formatPrice(lastPrice, tickSize)}${delimiter}`
        : '';

    const globalPairPart = pair ? `${pair}${delimiter}` : '';

    return `${pricePart}${globalPairPart}${APP_SITE_NAME}`;
  }

  updateTitle() {
    combineLatest([
      this.globalFacade.pair$,
      this.tickerFacade.lastPrice$,
      this.tickerFacade.tickSize$,
    ]).subscribe(([pair, lastPrice, tickSize]) => {
      const title = this.#createTitle({ pair, lastPrice, tickSize });

      this.titleService.setTitle(title);
    });
  }

  startWebSocket() {
    this.websocketService.connect();
  }

  navigateToDefaultPair() {
    this.globalFacade.pairUnderscore$.pipe(first()).subscribe((pair) => {
      this.router.navigate([pair]);
    });
  }

  initHomeData() {
    this.exchangeInfoFacade.loadData();
    this.tickerFacade.loadData();
  }

  onWebsocketStart() {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() => this.globalFacade.symbol$.pipe(first()))
      )
      .subscribe((symbol) => {
        this.homeWebsocketService.widgetsUpdateSubscriber.subscribe({
          orderBookParams: {
            limit: WIDGET_DEPTH_DEFAULT_LIMIT,
            symbol,
          },
          tradesParams: {
            symbol,
          },
        });
      });
  }

  onWebsocketMessage() {
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
        // onSubscribe(id) {
        //   console.log('subscribed', id);
        // },
        // onUnsubscribe(id) {
        //   console.log('unsubscribed', id);
        // },
      });
    });
  }
}
