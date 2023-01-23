import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { first } from 'rxjs';
import { CandlesRestService } from 'src/app/features/candles/services/candles-rest.service';
import { candlesSelectors } from 'src/app/features/candles/store';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { OrderBookRestService } from 'src/app/features/order-book/services/order-book-rest.service';
import { TickerRestService } from 'src/app/features/tickers/services/ticker-rest.service';
import { TradesRestService } from 'src/app/features/trades/services/trades-rest.service';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private candlesInterval$ = this.store.select(candlesSelectors.interval);

  public constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tickerRestService: TickerRestService,
    private orderBookRestService: OrderBookRestService,
    private candlesRestService: CandlesRestService,
    private tradesRestService: TradesRestService
  ) {}

  private loadExchangeInfo() {
    this.exchangeInfoRestService.loadData();
  }

  private loadTicker() {
    this.tickerRestService.loadData();
  }

  private loadCandles(symbol: string) {
    this.candlesInterval$.pipe(first()).subscribe((interval) => {
      this.candlesRestService.loadData({ symbol, interval });
    });
  }

  private loadOrderBookAndSubscribeToWebsocket(symbol: string) {
    this.orderBookRestService.loadData({ symbol });
  }

  private loadTrades(symbol: string) {
    this.tradesRestService.loadData({ symbol });
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

      this.loadExchangeInfo();
      this.loadTicker();
      this.loadCandles(symbol);
      this.loadOrderBookAndSubscribeToWebsocket(symbol);
      this.loadTrades(symbol);

      this.store.dispatch(
        globalActions.setCurrency({ payload: { base, quote } })
      );
    }
  }
}
