import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Candle } from '../models/candle.model';
import { CandlesGetParams } from '../models/candles-get-params.model';

@Injectable({
  providedIn: 'root',
})
export class CandlesService {
  public constructor(private http: HttpClient) {}

  public get(params: CandlesGetParams): Observable<Candle[]> {
    return this.http.get<Candle[]>('klines', { params });
  }
}
