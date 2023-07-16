import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, first } from 'rxjs';
import { ExchangeInfoFacade } from '../../exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { TickerFacade } from '../../ticker/services/ticker-facade.service';
import { APP_SITE_NAME } from 'src/app/shared/config';
import { formatPrice } from 'src/app/shared/helpers';
import { Title } from '@angular/platform-browser';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { CandlesFacade } from '../../candles/services/candles-facade.service';
import { OrderBookFacade } from '../../order-book/services/order-book-facade.service';
import { TradesFacade } from '../../trades/services/trades-facade.service';

@Injectable({ providedIn: 'root' })
export class HomerService {
  public constructor(
    private globalFacade: GlobalFacade,
    private router: Router,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private tickerFacade: TickerFacade,
    private titleService: Title,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private orderBookFacade: OrderBookFacade,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade
  ) {}

  public createTitle({
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

  public updateTitle() {
    combineLatest([
      this.globalFacade.pair$,
      this.tickerFacade.lastPrice$,
      this.tickerFacade.tickSize$,
    ]).subscribe(([pair, lastPrice, tickSize]) => {
      const title = this.createTitle({ pair, lastPrice, tickSize });

      this.titleService.setTitle(title);
    });
  }

  public startWebSocket() {
    this.websocketService.connect();
  }

  public navigateToDefaultPair() {
    this.globalFacade.pairUnderscore$.pipe(first()).subscribe((pair) => {
      this.router.navigate([pair]);
    });
  }

  public initHomeData() {
    this.exchangeInfoFacade.loadData();
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
