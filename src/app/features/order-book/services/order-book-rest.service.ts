import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderBook } from '../types/order-book';
import { OrderBookGetParams } from '../types/order-book-get-params';

@Injectable({
  providedIn: 'root',
})
export class OrderBookRestService {
  public constructor(private http: HttpClient) {}

  public get$(params: OrderBookGetParams): Observable<OrderBook> {
    return this.http.get<OrderBook>('depth', { params });
  }
}
