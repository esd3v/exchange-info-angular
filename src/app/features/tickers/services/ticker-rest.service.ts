import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from 'src/app/store';
import { Ticker } from '../types/ticker';
import { tickersActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class TickerRestService {
  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>('ticker/24hr');
  }

  public loadData() {
    this.store$.dispatch(tickersActions.load());
  }
}
