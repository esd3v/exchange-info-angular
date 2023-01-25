import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, Observable, Subject, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { Ticker } from '../models/ticker.model';
import { tickersActions, tickersSelectors } from '../store';
import { TickerWebsocketService } from './ticker-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TickerRestService {
  private websocketStatus$ = this.websocketService.status$;
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tickerStatus$ = this.store.select(tickersSelectors.status);

  public constructor(
    private http: HttpClient,
    private websocketService: WebsocketService,
    private tickerWebsocketService: TickerWebsocketService,
    private store: Store<AppState>
  ) {}

  public get(): Observable<Ticker[]> {
    return this.http.get<Ticker[]>('ticker/24hr');
  }

  public loadData() {
    this.store.dispatch(tickersActions.load());

    return this.tickerStatus$;
  }

  public loadDataOnAppInit(symbol: string) {
    const stop$ = new Subject<void>();

    this.loadData()
      .pipe(
        takeUntil(stop$),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        stop$.next();

        this.websocketStatus$
          .pipe(
            first(),
            filter((status) => status === 'open')
          )
          .subscribe(() => {
            this.tickerWebsocketService.subscribeToWebsocket(
              {
                symbols: [symbol],
              },
              this.tickerWebsocketService.websocketSubscriptionId.subscribe
                .single
            );
          });
      });
  }
}
