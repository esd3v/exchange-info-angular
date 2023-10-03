import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, first } from 'rxjs';
import { CandleChartContainerService } from 'src/app/features/candles/components/candle-chart-container/candle-chart-container.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { OrderBookTablesService } from 'src/app/features/order-book/components/order-book-tables/order-book-tables.service';
import { PairsTableService } from 'src/app/features/pairs/components/pairs-table/pairs-table.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import {
  APP_SITE_NAME,
  WEBSOCKET_ENABLED_AT_START,
} from 'src/app/shared/config';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TradeService } from './trade.service';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
})
export class TradeComponent implements OnInit {
  constructor(
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private tradeService: TradeService,
    private titleService: Title,
    private globalService: GlobalService,
    private exchangeInfoService: ExchangeInfoService,
    private tickerService: TickerService,
    private websocketService: WebsocketService,
    private candleChartContainerService: CandleChartContainerService,
    private orderBookTablesService: OrderBookTablesService,
    private tradesTableService: TradesTableService,
    private pairsTableService: PairsTableService
  ) {}

  #setCurrency() {
    const pair = this.route.snapshot.paramMap.get('pair');

    if (!pair) {
      return;
    }

    const { base, quote } = convertPairToCurrency(pair, '_');

    this.globalService.setCurrency({ base, quote });
  }

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

  #updateTitle() {
    combineLatest([
      this.globalService.pair$,
      this.tickerService.globalTicker$,
    ]).subscribe(([globalPair, globalTicker]) => {
      const title = this.#createTitle({
        pair: globalPair.slash,
        lastPrice: globalTicker?.lastPrice,
        tickSize: globalTicker?.tickSize,
      });

      this.titleService.setTitle(title);
    });
  }

  ngOnInit(): void {
    this.#setCurrency();
    this.#updateTitle();

    if (WEBSOCKET_ENABLED_AT_START) {
      this.tradeService.startWebSocket();
    }

    this.tradeService.onWebsocketMessage();
    this.tradeService.onWebsocketStatus();

    // Exchange info
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.exchangeInfoService.loadData();

    // Ticker
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.tickerService.loadData();
    this.tickerService.onWebsocketOpen();

    // Candle chart
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === 'closed') {
        // Load REST data only if we start the app with websockets disabled
        this.candleChartContainerService.loadData();
      }
    });

    this.candleChartContainerService.onWebsocketOpen();
    this.candleChartContainerService.onRestAndDataComplete();

    // Order book table
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === 'closed') {
        // Load REST data only if we start the app with websockets disabled
        this.orderBookTablesService.loadData();
      }
    });

    this.orderBookTablesService.onWebsocketOpen();
    this.orderBookTablesService.onRestAndDataComplete();

    // Trades table
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === 'closed') {
        // Load REST data only if we start the app with websockets disabled
        this.tradesTableService.loadData();
      }
    });

    this.tradesTableService.onWebsocketOpen();
    this.tradesTableService.onRestAndDataComplete();

    // Pairs table
    //////////////////////////////////////////
    //////////////////////////////////////////
    this.pairsTableService.onWebsocketOpen();
    this.pairsTableService.onRestAndDataComplete();
  }
}
