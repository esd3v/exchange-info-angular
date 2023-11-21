import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeInfo } from '../types/exchange-info';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { exchangeInfoSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoRestService {
  status$ = this.store$.select(exchangeInfoSelectors.status);

  constructor(
    private http: HttpClient,
    private store$: Store<AppState>,
  ) {}

  get$(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }
}
