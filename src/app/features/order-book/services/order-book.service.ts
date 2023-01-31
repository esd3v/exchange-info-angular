import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, mergeMap, Subject, takeUntil, tap } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBook } from '../models/order-book.model';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookService {
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private websocketStatus$ = this.websocketService.status$;
  private orderBookStatus$ = this.store$.select(orderBookSelectors.status);

  public constructor(
    private store$: Store<AppState>,
    private websocketService: WebsocketService,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  public onWebsocketOpen() {
    const stop$ = new Subject<void>();

    this.websocketStatus$
      .pipe(filter((status) => status === 'open'))
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.orderBookStatus$.pipe(
              filter((status) => status === 'success'),
              takeUntil(stop$)
            ),
            this.globalSymbol$.pipe(filter(Boolean), takeUntil(stop$)),
          ]);
        }),
        tap(() => {
          stop$.next();
        })
      )
      .subscribe(([_tickerStatus, symbol]) => {
        this.orderBookWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.orderBookWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleWebsocketData({ asks, bids, lastUpdateId }: WebsocketOrderBook) {
    const orderBook: OrderBook = {
      asks,
      bids,
      lastUpdateId,
    };

    this.store$.dispatch(orderBookActions.set(orderBook));
  }
}
