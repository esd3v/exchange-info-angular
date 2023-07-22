import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ticker } from '../types/ticker';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { tickerSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class TickerRestService {
  public status$ = this.store$.select(tickerSelectors.status);

  public constructor(
    private http: HttpClient,
    private store$: Store<AppState>
  ) {}

  public get$(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>('ticker/24hr');
  }
}
