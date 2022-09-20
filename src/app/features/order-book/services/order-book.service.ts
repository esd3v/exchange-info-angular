import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrderBook } from '../models/order-book.model';
import { OrderBookGetParams } from '../models/order-book-get-params.model';

@Injectable({
  providedIn: 'root',
})
export class OrderBookService {
  public constructor(private http: HttpClient) {}

  public get(params: OrderBookGetParams): Observable<OrderBook> {
    return this.http.get<OrderBook>('depth', { params });
  }
}
