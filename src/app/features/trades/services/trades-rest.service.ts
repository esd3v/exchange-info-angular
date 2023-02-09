import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trades } from '../types/trades';
import { TradesGetParams } from '../types/trades-get-params';

@Injectable({
  providedIn: 'root',
})
export class TradesRestService {
  public constructor(private http: HttpClient) {}

  public get$(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }
}
