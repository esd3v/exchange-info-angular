import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, mergeMap, Subject, takeUntil, tap } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTrades } from '../models/websocket-trades.model';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private websocketStatus$ = this.websocketService.status$;
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tradesStatus$ = this.store.select(tradesSelectors.status);

  public constructor(
    private store: Store<AppState>,
    private websocketService: WebsocketService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onWebsocketOpen() {
    const stop$ = new Subject<void>();

    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.tradesStatus$.pipe(
              takeUntil(stop$),
              filter((status) => status === 'success')
            ),
            this.globalSymbol$.pipe(takeUntil(stop$), filter(Boolean)),
          ]);
        }),
        tap(() => {
          stop$.next();
        })
      )
      .subscribe(([_tickerStatus, symbol]) => {
        this.tradesWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    const trades: TradesEntity = {
      price: p,
      qty: q,
      isBuyerMaker: m,
      time: T,
    };

    this.store.dispatch(tradesActions.add({ trades }));
    this.store.dispatch(tradesActions.removeLast());
  }
}
