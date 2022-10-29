import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TradesGetParams } from '../models/trades-get-params.model';
import { Trades } from '../models/trades.model';

@Injectable({
  providedIn: 'root',
})
export class TradesService {
  public constructor(private http: HttpClient) {}

  public get(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }
}
