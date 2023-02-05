import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first, timer } from 'rxjs';
import { API_START_DELAY } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { CandlesService } from '../../candles/services/candles.service';
import { ExchangeInfoRestService } from '../../exchange-info/services/exchange-info-rest.service';
import { OrderBookService } from '../../order-book/services/order-book.service';
import { TickerService } from '../../tickers/services/ticker.service';
import { TradesService } from '../../trades/services/trades.service';

@Injectable({ providedIn: 'root' })
export class HomerService {
  public constructor(
    private store$: Store<AppState>,
    private router: Router,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tradesService: TradesService,
    private candlesService: CandlesService,
    private orderBookService: OrderBookService,
    private tickerService: TickerService
  ) {}

  public navigateToDefaultPair() {
    this.store$
      .select(globalSelectors.globalPairUnderscore)
      .pipe(first(), filter(Boolean))
      .subscribe((pair) => {
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
