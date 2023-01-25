import { ExchangeInfo } from '../models/exchange-info.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { exchangeInfoActions, exchangeInfoSelectors } from '../store';
import { AppState } from 'src/app/store';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoRestService {
  private exchangeInfoStatus$ = this.store.select(exchangeInfoSelectors.status);

  public constructor(
    private http: HttpClient,
    private store: Store<AppState>
  ) {}

  public get(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }

  public loadData() {
    this.store.dispatch(exchangeInfoActions.load());

    return this.exchangeInfoStatus$;
  }
}
