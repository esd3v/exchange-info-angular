import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBook } from '../types/order-book';
import { OrderBookGetParams } from '../types/order-book-get-params';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { orderBookSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class OrderBookRestService {
  public restStatus$ = this.store$.select(orderBookSelectors.status);

  public constructor(
    private store$: Store<AppState>,
    private http: HttpClient
  ) {}

  public get$(params: OrderBookGetParams): Observable<OrderBook> {
    return this.http.get<OrderBook>('depth', { params });
  }
}
