import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import { ExchangeInfo } from '../models/exchange-info.model';
import { exchangeInfoActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoRestService {
  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(): Observable<ExchangeInfo> {
    return this.http.get<ExchangeInfo>('exchangeInfo');
  }

  public loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
