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
  public status$ = this.store$.select(exchangeInfoSelectors.status);

  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }
}
