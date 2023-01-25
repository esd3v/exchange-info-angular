import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { Candle } from '../models/candle.model';
import { CandlesGetParams } from '../models/candles-get-params.model';
import { candlesActions, candlesSelectors } from '../store';
import { CandlesWebsocketService } from './candles-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class CandlesRestService {
  private candlesStatus$ = this.store.select(candlesSelectors.status);
  private candlesInterval$ = this.store.select(candlesSelectors.interval);
  private websocketStatus$ = this.websocketService.status$;

  public constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private store: Store<AppState>
  ) {}

  public get(params: CandlesGetParams): Observable<Candle[]> {
    return this.http.get<Candle[]>('klines', { params });
  }

  public loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store.dispatch(candlesActions.load(params));

    return this.candlesStatus$;
  }

  public loadDataOnAppInit({
    symbol,
  }: Pick<Parameters<typeof candlesActions.load>[0], 'symbol'>) {
    const stop$ = new Subject<void>();

    this.candlesInterval$.pipe(first()).subscribe((interval) => {
      this.loadData({ symbol, interval })
        .pipe(
          takeUntil(stop$),
          filter((status) => status === 'success')
        )
        .subscribe(() => {
          stop$.next();

          this.websocketStatus$
            .pipe(
              first(),
              filter((status) => status === 'open')
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
        });
    });
  }
}
