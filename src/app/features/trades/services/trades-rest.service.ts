import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { TradesGetParams } from '../models/trades-get-params.model';
import { Trades } from '../models/trades.model';
import { tradesActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class TradesRestService {
  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }

  public loadData({
    symbol,
    limit = WIDGET_TRADES_DEFAULT_LIMIT,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }
}
