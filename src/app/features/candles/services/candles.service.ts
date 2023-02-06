import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  mergeMap,
  Subject,
  take,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';
import { CandleInterval } from '../types/candle-interval';
import { CandlesGetParams } from '../types/candles-get-params';
import { WebsocketCandle } from '../types/websocket-candle';
import { CandlesRestService } from './candles-rest.service';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesService {
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);

  public interval$ = this.store$.select(candlesSelectors.interval);
  public currentInterval$ = this.interval$.pipe(first());
  public status$ = this.store$.select(candlesSelectors.status);

  public constructor(
    private websocketService: WebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private candlesRestService: CandlesRestService,
    private store$: Store<AppState>
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof candlesActions.load>[0], 'symbol'>) {
    this.currentInterval$.subscribe((interval) => {
      this.loadDataAndSubscribe({ symbol, interval }, false);
    });
  }

  // Runs every time when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.websocketService.reasonOnce$,
            this.globalSymbol$.pipe(first(), filter(Boolean)),
            this.currentInterval$,
            this.status$.pipe(
              // first() comes first to check if data is CURRENTLY loaded
              // to prevent double loading when data loaded AFTER ws opened
              first(),
              filter((status) => status === 'success')
            ),
          ]);
        })
      )
      .subscribe(([reason, symbol, interval]) => {
        // If we enable ws by switch for the first time or re-enable it
        if (reason === 'switch' || reason === 'restored') {
          this.candlesRestService.loadData({ symbol, interval });
        }

        this.candlesWebsocketService.subscribeToWebsocket(
          {
            symbol,
            interval,
          },
          this.candlesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public loadDataAndSubscribe(
    { interval, symbol }: CandlesGetParams,
    unsubscribePrevious: boolean
  ) {
    const stop$ = new Subject<void>();

    this.candlesRestService.loadData({
      symbol,
      interval,
    });

    const success$ = this.status$.pipe(
      filter((status) => status === 'success'),
      takeUntil(stop$)
    );

    combineLatest([
      this.currentInterval$,
      this.websocketService.openOnce$,
      success$,
    ])
      .pipe(
        tap(([previousCandleInterval]) => {
          if (unsubscribePrevious) {
            this.candlesWebsocketService.unsubscribeFromWebsocket(
              {
                interval: previousCandleInterval,
                symbol,
              },
              this.candlesWebsocketService.websocketSubscriptionId.unsubscribe
            );
          }
        }),
        mergeMap(() =>
          timer(unsubscribePrevious ? WEBSOCKET_SUBSCRIPTION_DELAY : 0)
        )
      )
      .subscribe(() => {
        stop$.next();

        this.store$.dispatch(candlesActions.setInterval({ interval }));

        this.candlesWebsocketService.subscribeToWebsocket(
          {
            interval,
            symbol,
          },
          this.candlesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public onIntervalChange(interval: CandleInterval) {
    this.globalSymbol$.pipe(first(), filter(Boolean)).subscribe((symbol) => {
      this.loadDataAndSubscribe({ interval, symbol }, true);
    });
  }

  public handleWebsocketData({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    const ohlc$ = this.store$.select(candlesSelectors.ohlc);

    ohlc$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item[4]);

      if (ohlcExists) {
        this.store$.dispatch(candlesActions.updateCandle({ candle }));
      } else {
        this.store$.dispatch(candlesActions.addCandle({ candle }));
        this.store$.dispatch(candlesActions.removeFirstCandle());
      }
    });
  }
}
