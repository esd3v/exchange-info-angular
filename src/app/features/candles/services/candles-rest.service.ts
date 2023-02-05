import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import { Candle } from '../types/candle';
import { CandlesGetParams } from '../types/candles-get-params';
import { candlesActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class CandlesRestService {
  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: CandlesGetParams): Observable<Candle[]> {
    return this.http.get<Candle[]>('klines', { params });
  }

  public loadData(params: Parameters<typeof candlesActions.load>[0]) {
    this.store$.dispatch(candlesActions.load(params));
  }
}
