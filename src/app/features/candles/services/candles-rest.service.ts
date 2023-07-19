import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Candle } from '../types/candle';
import { CandlesGetParams } from '../types/candles-get-params';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { candlesSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class CandlesRestService {
  public status$ = this.store$.select(candlesSelectors.status);

  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: CandlesGetParams): Observable<Candle[]> {
    return this.http.get<Candle[]>('klines', { params });
  }
}
