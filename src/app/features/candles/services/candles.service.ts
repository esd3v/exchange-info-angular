import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  map,
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
import { CandleInterval } from '../models/candle-interval.model';
import { Candle } from '../models/candle.model';
import { CandlesGetParams } from '../models/candles-get-params.model';
import { WebsocketCandle } from '../models/websocket-candle.model';
import { candlesActions, candlesSelectors } from '../store';
import { CandlesRestService } from './candles-rest.service';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesService {
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private candlesStatus$ = this.store$.select(candlesSelectors.status);
  private candlesInterval$ = this.store$.select(candlesSelectors.interval);
  private websocketStatus$ = this.websocketService.status$;
  private websocketReason$ = this.websocketService.reason$;
  private firstCandlesInterval$ = this.candlesInterval$.pipe(first());

  private websocketOpened$ = this.websocketStatus$.pipe(
    filter((status) => status === 'open')
  );

  // Don't replace with this.websocketOpened$.pipe(first())
  // because first() should come first
  private currentWebsocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private websocketService: WebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private candlesRestService: CandlesRestService,
    private store$: Store<AppState>
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof candlesActions.load>[0], 'symbol'>) {
    this.firstCandlesInterval$.subscribe((interval) => {
      this.loadDataAndSubscribe({ symbol, interval }, false);
    });
  }

  // Runs every time when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    this.websocketOpened$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.websocketReason$.pipe(first()),
            this.candlesStatus$.pipe(
              // first() comes first to check if data is CURRENTLY loaded
              // to prevent double loading when data loaded AFTER ws opened
              first(),
              filter((status) => status === 'success')
            ),
            this.globalSymbol$.pipe(first(), filter(Boolean)),
            this.candlesInterval$.pipe(first()),
          ]);
        })
      )
      .subscribe(([websocketReason, _candlesStatus, symbol, interval]) => {
        // If we enable ws by switch for the first time or re-enable it
        if (websocketReason === 'switch' || websocketReason === 'restored') {
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

    const success$ = this.candlesStatus$.pipe(
      filter((status) => status === 'success'),
      takeUntil(stop$)
    );

    combineLatest([
      this.firstCandlesInterval$,
      this.currentWebsocketOpened$,
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
