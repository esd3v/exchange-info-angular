import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TradesGetParams } from '../models/trades-get-params.model';
import { Trades } from '../models/trades.model';
import { tradesActions, tradesSelectors } from '../store';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TradesRestService {
  private websocketStatus$ = this.websocketService.status$;
  private tradesStatus$ = this.store.select(tradesSelectors.status);

  public constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
    private tradesWebsocketService: TradesWebsocketService,
    private store: Store<AppState>
  ) {}

  public get(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }

  public loadData({
    symbol,
    limit = 20,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store.dispatch(tradesActions.load({ symbol, limit }));

    return this.tradesStatus$;
  }

  public loadDataOnAppInit({
    symbol,
  }: Pick<Parameters<typeof tradesActions.load>[0], 'symbol'>) {
    const stop$ = new Subject<void>();

    this.loadData({ symbol })
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
            this.tradesWebsocketService.subscribeToWebsocket(
              {
                symbol,
              },
              this.tradesWebsocketService.websocketSubscriptionId.subscribe
            );
          });
      });
  }
}
