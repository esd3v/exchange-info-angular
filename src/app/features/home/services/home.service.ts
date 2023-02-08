import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';
import { API_START_DELAY } from 'src/app/shared/config';
import { CandlesFacade } from '../../candles/services/candles-facade.service';
import { ExchangeInfoRestService } from '../../exchange-info/services/exchange-info-rest.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { OrderBookFacade } from '../../order-book/services/order-book-facade.service';
import { TickerFacade } from '../../tickers/services/ticker-facade.service';
import { TradesFacade } from '../../trades/services/trades-facade.service';

@Injectable({ providedIn: 'root' })
export class HomerService {
  public constructor(
    private globalFacade: GlobalFacade,
    private router: Router,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private orderBookFacade: OrderBookFacade,
    private tickerFacade: TickerFacade
  ) {}

  public navigateToDefaultPair() {
    this.globalFacade.globalPairUnderscoreCurrent$.subscribe((pair) => {
      this.router.navigate([pair]);
    });
  }

  public initAppData(symbol: string) {
    timer(API_START_DELAY).subscribe(() => {
      this.exchangeInfoRestService.loadData();
      this.tickerFacade.onAppInit(symbol);
      this.candlesFacade.onAppInit({ symbol });
      this.orderBookFacade.onAppInit({ symbol });
      this.tradesFacade.onAppInit({ symbol });
    });
  }
}
