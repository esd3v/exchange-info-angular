import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, mergeMap, Subject } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTicker } from '../types/websocket-ticker';
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

  private websocketOpened$ = this.websocketStatus$.pipe(
    filter((status) => status === 'open')
  );

  // Don't replace with this.websocketOpened$.pipe(first())
  // because first() should come first
  private currentWebsocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public status$ = this.store$.select(tickersSelectors.status);

  public constructor(
    private tickerRestService: TickerRestService,
    private tickerWebsocketService: TickerWebsocketService,
    private websocketService: WebsocketService,
    private store$: Store<AppState>
  ) {}

  public onAppInit(symbol: string) {
    const stop$ = new Subject<void>();

    const success$ = this.status$.pipe(
      filter((status) => status === 'success')
    );

    this.tickerRestService.loadData();

    combineLatest([success$, this.currentWebsocketOpened$]).subscribe(() => {
      stop$.next();

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
    this.websocketOpened$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.globalSymbol$.pipe(first(), filter(Boolean)),
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
