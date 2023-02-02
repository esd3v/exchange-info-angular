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
} from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { Candle } from '../models/candle.model';
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
  private currentCandlesInterval$ = this.candlesInterval$.pipe(first());

  private websocketOpened$ = this.websocketStatus$.pipe(
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
    this.currentCandlesInterval$
      .pipe(
        mergeMap((interval) => {
          const status$ = this.candlesRestService.loadData({
            symbol,
            interval,
          });

          const stop$ = status$.pipe(filter((status) => status === 'success'));
          const success$ = status$.pipe(takeUntil(stop$));

          return combineLatest([success$, this.websocketOpened$]).pipe(
            map(() => interval)
          );
        })
      )
      .subscribe((interval) => {
        this.candlesWebsocketService.subscribeToWebsocket(
          {
            interval,
            symbol,
          },
          this.candlesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  // Runs every time when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.websocketReason$.pipe(first()),
            this.candlesStatus$.pipe(
              // If data is CURRENTLY loaded
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
