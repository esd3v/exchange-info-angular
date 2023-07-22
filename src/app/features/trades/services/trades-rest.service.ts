import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Trades } from '../types/trades';
import { TradesGetParams } from '../types/trades-get-params';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { tradesSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class TradesRestService {
  public status$ = this.store$.select(tradesSelectors.status);

  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(params: TradesGetParams): Observable<Trades[]> {
    return this.http.get<Trades[]>('trades', { params });
  }
}
