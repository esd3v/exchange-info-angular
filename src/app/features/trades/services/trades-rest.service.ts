import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import { TradesGetParams } from '../models/trades-get-params.model';
import { Trades } from '../models/trades.model';
import { tradesActions, tradesSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class TradesRestService {
  private tradesStatus$ = this.store$.select(tradesSelectors.status);

  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }

  public loadData({
    symbol,
    limit = 20,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));

    return this.tradesStatus$;
  }
}
