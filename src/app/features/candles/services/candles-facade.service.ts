import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, mergeMap, take, timer } from 'rxjs';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { candlesActions, candlesSelectors } from '../store';
import { Candle } from '../types/candle';
import { CandleInterval } from '../types/candle-interval';
import { WebsocketCandle } from '../types/websocket-candle';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesFacade {
  public interval$ = this.store$.select(candlesSelectors.interval);
  public status$ = this.store$.select(candlesSelectors.status);

  public intervalCurrent$ = this.interval$.pipe(first());

  public successCurrent$ = this.status$.pipe(
    first(), // Order shouldn't be changed
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first() // Order shouldn't be changed
  );

  public isLoading$ = this.status$.pipe(map((status) => status === 'loading'));

  public ohlc$ = this.store$.select(candlesSelectors.ohlc);
  public dates$ = this.store$.select(candlesSelectors.dates);
  public volumes$ = this.store$.select(candlesSelectors.volumes);

  public constructor(
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private store$: Store<AppState>
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof candlesActions.load>[0], 'symbol'>) {
    this.intervalCurrent$.subscribe((interval) => {
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
            this.websocketService.reasonCurrent$,
            this.globalFacade.globalSymbolCurrent$,
            this.intervalCurrent$,
            // Check if data is CURRENTLY loaded
            // to prevent double loading when data loaded AFTER ws opened
            this.successCurrent$,
          ]);
        })
      )
      .subscribe(([reason, symbol, interval]) => {
        // If we enable ws by switch for the first time or re-enable it
        if (reason === 'switch' || reason === 'restored') {
          this.loadData({ symbol, interval });
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
    { interval, symbol }: Parameters<typeof candlesActions.load>[0],
    unsubscribePrevious: boolean // TODO replace with auto subscribe check
  ) {
    combineLatest([
      this.intervalCurrent$,
      this.globalFacade.globalSymbolCurrent$,
      this.websocketService.openCurrent$,
    ]).subscribe(([currentInterval, globalSymbol]) => {
      if (unsubscribePrevious) {
        this.candlesWebsocketService.unsubscribeFromWebsocket(
          {
            interval: currentInterval,
            symbol: globalSymbol,
          },
          this.candlesWebsocketService.websocketSubscriptionId.unsubscribe
        );
      }
    });

    this.loadData({
      symbol,
      interval,
    });

    combineLatest([this.websocketService.openCurrent$, this.successUntil$])
      .pipe(
        mergeMap(() =>
          timer(unsubscribePrevious ? WEBSOCKET_SUBSCRIPTION_DELAY : 0)
        )
      )
      .subscribe(() => {
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
    this.globalFacade.globalSymbolCurrent$.subscribe((symbol) => {
      this.loadDataAndSubscribe({ interval, symbol }, true);
      this.store$.dispatch(candlesActions.setInterval({ interval }));
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

  public loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }
}
