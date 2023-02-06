import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { API_START_DELAY } from 'src/app/shared/config';
import { GlobalService } from 'src/app/shared/services/global.service';
import { AppState } from 'src/app/store';
import { CandlesService } from '../../candles/services/candles.service';
import { ExchangeInfoRestService } from '../../exchange-info/services/exchange-info-rest.service';
import { OrderBookService } from '../../order-book/services/order-book.service';
import { TickerService } from '../../tickers/services/ticker.service';
import { TradesService } from '../../trades/services/trades.service';

@Injectable({ providedIn: 'root' })
export class HomerService {
  public constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService,
    private router: Router,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tradesService: TradesService,
    private candlesService: CandlesService,
    private orderBookService: OrderBookService,
    private tickerService: TickerService
  ) {}

  public navigateToDefaultPair() {
    this.globalService.globalPairUnderscoreCurrent$.subscribe((pair) => {
      this.router.navigate([pair]);
    });
  }

  public initAppData(symbol: string) {
    timer(API_START_DELAY).subscribe(() => {
      this.exchangeInfoRestService.loadData();
      this.tickerService.onAppInit(symbol);
      this.candlesService.onAppInit({ symbol });
      this.orderBookService.onAppInit({ symbol });
      this.tradesService.onAppInit({ symbol });
    });
  }
}
