import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { OrderBookGetParams } from '../models/order-book-get-params.model';
import { OrderBook } from '../models/order-book.model';
import { orderBookActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class OrderBookRestService {
  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: OrderBookGetParams): Observable<OrderBook> {
    return this.http.get<OrderBook>('depth', { params });
  }

  public loadData({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: Parameters<typeof orderBookActions.load>[0]) {
    this.store$.dispatch(orderBookActions.load({ symbol, limit }));
  }
}
