import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { CandlesRestService } from 'src/app/features/candles/services/candles-rest.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { OrderBookRestService } from 'src/app/features/order-book/services/order-book-rest.service';
import { TickerRestService } from 'src/app/features/tickers/services/ticker-rest.service';
import { TradesRestService } from 'src/app/features/trades/services/trades-rest.service';
import { REST_START_DELAY } from 'src/app/shared/config';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private websocketService: WebsocketService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tickerRestService: TickerRestService,
    private orderBookRestService: OrderBookRestService,
    private candlesRestService: CandlesRestService,
    private tradesRestService: TradesRestService
  ) {}

  private loadExchangeInfo() {
    this.exchangeInfoRestService.loadData();
  }

  private loadTicker(symbol: string) {
    this.tickerRestService.loadDataOnAppInit(symbol);
  }

  private loadCandles(symbol: string) {
    this.candlesRestService.loadDataOnAppInit({ symbol });
  }

  private loadOrderBook(symbol: string) {
    this.orderBookRestService.loadDataOnAppInit({ symbol });
  }

  private loadTrades(symbol: string) {
    this.tradesRestService.loadDataOnAppInit({ symbol });
  }

  private getParsedRoutePair() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair !== null) {
      const { base, quote } = parsePair(routePair, '_');

      if (base && quote) {
        return { base, quote };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public ngOnInit() {
    const parsedRoutePair = this.getParsedRoutePair();

    if (parsedRoutePair) {
      const { base, quote } = parsedRoutePair;
      const symbol = `${base}${quote}`;

      timer(REST_START_DELAY).subscribe(() => {
        this.loadExchangeInfo();
        this.loadTicker(symbol);
        this.loadCandles(symbol);
        this.loadOrderBook(symbol);
        this.loadTrades(symbol);
      });

      this.store.dispatch(
        globalActions.setCurrency({ payload: { base, quote } })
      );
    }
  }
}
