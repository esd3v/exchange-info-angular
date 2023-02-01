import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  mergeMap,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTicker } from '../models/websocket-ticker.model';
import { tickersActions, tickersSelectors } from '../store';
import { TickerEntity } from '../store/tickers.state';
import { TickerRestService } from './ticker-rest.service';
import { TickerWebsocketService } from './ticker-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  private websocketStatus$ = this.websocketService.status$;
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private tickerStatus$ = this.store$.select(tickersSelectors.status);

  private websocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private tickerRestService: TickerRestService,
    private tickerWebsocketService: TickerWebsocketService,
    private websocketService: WebsocketService,
    private store$: Store<AppState>
  ) {}

  public onAppInit(symbol: string) {
    const status$ = this.tickerRestService.loadData();
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
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
    const stop$ = new Subject<void>();

    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.tickerStatus$.pipe(
              filter((status) => status === 'success'),
              takeUntil(stop$)
            ),
            this.globalSymbol$.pipe(filter(Boolean), takeUntil(stop$)),
          ]);
        }),
        tap(() => {
          stop$.next();
        })
      )
      .subscribe(([_tickerStatus, symbol]) => {
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
