import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBookGetParams } from '../models/order-book-get-params.model';
import { OrderBook } from '../models/order-book.model';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class OrderBookRestService {
  private orderBookStatus$ = this.store.select(orderBookSelectors.status);
  private websocketStatus$ = this.websocketService.status$;

  public constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private store: Store<AppState>
  ) {}

  public get(params: OrderBookGetParams): Observable<OrderBook> {
    return this.http.get<OrderBook>('depth', { params });
  }

  public loadData({
    symbol,
    limit = 20,
  }: Parameters<typeof orderBookActions.load>[0]) {
    this.store.dispatch(orderBookActions.load({ symbol, limit }));

    return this.orderBookStatus$;
  }

  public loadDataOnAppInit({
    symbol,
  }: Pick<Parameters<typeof orderBookActions.load>[0], 'symbol'>) {
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
            this.orderBookWebsocketService.subscribeToWebsocket(
              {
                symbol,
              },
              this.orderBookWebsocketService.websocketSubscriptionId.subscribe
            );
          });
      });
  }
}
