import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, mergeMap } from 'rxjs';
import { GlobalService } from 'src/app/shared/services/global.service';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { tickersActions, tickersSelectors } from '../store';
import { TickerEntity } from '../store/tickers.state';
import { WebsocketTicker } from '../types/websocket-ticker';
import { TickerRestService } from './ticker-rest.service';
import { TickerWebsocketService } from './ticker-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  public status$ = this.store$.select(tickersSelectors.status);

  public success$ = this.status$.pipe(filter((status) => status === 'success'));

  public successCurrent$ = this.success$.pipe(first());

  public constructor(
    private globalService: GlobalService,
    private tickerRestService: TickerRestService,
    private tickerWebsocketService: TickerWebsocketService,
    private websocketService: WebsocketService,
    private store$: Store<AppState>
  ) {}

  public onAppInit(symbol: string) {
    this.tickerRestService.loadData();

    combineLatest([
      this.successCurrent$,
      this.websocketService.openOnce$,
    ]).subscribe(() => {
      this.tickerWebsocketService.subscribeToWebsocket(
        {
          symbols: [symbol],
        },
        this.tickerWebsocketService.websocketSubscriptionId.subscribe.single
      );
    });
  }

  // Runs once when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.globalService.globalSymbolCurrent$,
            this.status$.pipe(
              // first() comes first to check if data is CURRENTLY loaded
              // to prevent double loading when data loaded AFTER ws opened
              first(),
              filter((status) => status === 'success')
            ),
          ]);
        })
      )
      .subscribe(([symbol]) => {
        this.tickerWebsocketService.subscribeToWebsocket(
          {
            symbols: [symbol],
          },
          this.tickerWebsocketService.websocketSubscriptionId.subscribe.single
        );
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

    this.store$.dispatch(tickersActions.update({ data: ticker }));
  }
}
