import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, take } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { Reason } from 'src/app/websocket/services/websocket.service';
import { Candle } from '../models/candle.model';
import { WebsocketCandle } from '../models/websocket-candle.model';
import { candlesActions, candlesSelectors } from '../store';
import { CandlesRestService } from './candles-rest.service';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesService {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private candlesStatus$ = this.store.select(candlesSelectors.status);
  private candlesInterval$ = this.store.select(candlesSelectors.interval);

  public constructor(
    private candlesWebsocketService: CandlesWebsocketService,
    private candlesRestService: CandlesRestService,
    private store: Store<AppState>
  ) {}

  // Runs once when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen(reason: Reason) {
    this.candlesStatus$
      .pipe(
        first(),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        this.globalSymbol$
          .pipe(first(), filter(Boolean))
          .subscribe((symbol) => {
            this.candlesInterval$.pipe(first()).subscribe((interval) => {
              // If app loaded with ws disabled
              // or ws re-enabled after disabling it manually before
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
          });
      });
  }

  public handleWebsocketData({
    k: { t, o, h, l, c, v, T, B, n, q, V, Q },
  }: WebsocketCandle) {
    const ohlc$ = this.store.select(candlesSelectors.ohlc);

    ohlc$.pipe(take(1)).subscribe((data) => {
      const candle: Candle = [t, o, h, l, c, v, T, q, n, V, Q, B];
      // If ohlc with same time already exists in candles array
      const ohlcExists = data.some((item) => candle[0] === item[4]);

      if (ohlcExists) {
        this.store.dispatch(candlesActions.updateCandle({ candle }));
      } else {
        this.store.dispatch(candlesActions.addCandle({ candle }));
        this.store.dispatch(candlesActions.removeFirstCandle());
      }
    });
  }
}
