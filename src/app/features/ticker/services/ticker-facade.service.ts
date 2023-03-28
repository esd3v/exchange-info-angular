import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, timer } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';
import { WebsocketTicker } from '../types/websocket-ticker';
import { TickerWebsocketService } from './ticker-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TickerFacade {
  public status$ = this.store$.select(tickerSelectors.status);

  public success$ = this.status$.pipe(filter((status) => status === 'success'));

  public successCurrent$ = this.status$.pipe(
    first(),
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first()
  );

  public lastPrice$ = this.store$.select(tickerSelectors.lastPrice);

  public tickSize$ = this.store$.select(tickerSelectors.tickSize);

  public formattedLastPrice$ = this.store$.select(
    tickerSelectors.formattedLastPrice
  );

  public prevLastPrice$ = this.store$.select(tickerSelectors.prevLastPrice);

  public tickers$ = this.store$.select(tickerSelectors.tickers);

  public isLoading$ = this.status$.pipe(map((status) => status === 'loading'));

  public priceChange$ = this.store$.select(tickerSelectors.priceChange);

  public priceChangePercent$ = this.store$.select(
    tickerSelectors.priceChangePercent
  );

  public lastQuantity$ = this.store$.select(tickerSelectors.lastQuantity);

  public numberOfTrades$ = this.store$.select(tickerSelectors.numberOfTrades);

  public constructor(
    private globalFacade: GlobalFacade,
    private tickerWebsocketService: TickerWebsocketService,
    private websocketService: WebsocketService,
    private store$: Store<AppState>
  ) {}

  public onAppInit(symbol: string) {
    this.loadDataAndSubscribe({ symbol }, 0);
  }

  // Runs once when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    combineLatest([
      this.globalFacade.globalSymbolCurrent$,
      // Check if data is CURRENTLY loaded
      // to prevent double loading when data loaded AFTER ws opened
      this.successCurrent$,
    ]).subscribe(([symbol]) => {
      this.tickerWebsocketService.subscribe({
        symbols: [symbol],
      });
    });
  }

  public handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    const ticker: TickerEntity = {
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    };

    this.store$.dispatch(tickerActions.update({ data: ticker }));
  }

  public loadData() {
    this.store$.dispatch(tickerActions.load());
  }

  public loadDataAndSubscribe({ symbol }: { symbol: string }, delay: number) {
    this.loadData();

    combineLatest([this.successUntil$, timer(delay)]).subscribe(() => {
      if (this.websocketService.status$.getValue() === 'open') {
        this.tickerWebsocketService.subscribe({
          symbols: [symbol],
        });
      }
    });
  }
}
