import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
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

  public constructor(
    private websocketService: WebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private candlesRestService: CandlesRestService,
    private store$: Store<AppState>
  ) {}

  // Runs every time when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    const stop$ = new Subject<void>();

    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.websocketReason$.pipe(takeUntil(stop$)),
            this.candlesStatus$.pipe(
              filter((status) => status === 'success'),
              takeUntil(stop$)
            ),
            this.globalSymbol$.pipe(filter(Boolean), takeUntil(stop$)),
            this.candlesInterval$.pipe(takeUntil(stop$)),
          ]);
        }),
        tap(() => {
          stop$.next();
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
