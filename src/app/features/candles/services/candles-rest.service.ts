import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candle } from '../types/candle';
import { CandlesGetParams } from '../types/candles-get-params';

@Injectable({
  providedIn: 'root',
})
export class CandlesRestService {
  public constructor(private http: HttpClient) {}

  public get$(params: CandlesGetParams): Observable<Candle[]> {
    return this.http.get<Candle[]>('klines', { params });
  }
}
