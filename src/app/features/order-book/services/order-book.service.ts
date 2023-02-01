import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  filter,
  first,
  mergeMap,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBook } from '../models/order-book.model';
import { WebsocketOrderBook } from '../models/websocket-order-book.model';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBookRestService } from './order-book-rest.service';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookService {
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private websocketStatus$ = this.websocketService.status$;
  private orderBookStatus$ = this.store$.select(orderBookSelectors.status);

  private websocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private store$: Store<AppState>,
    private websocketService: WebsocketService,
    private orderBookRestService: OrderBookRestService,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof orderBookActions.load>[0], 'symbol'>) {
    const status$ = this.orderBookRestService.loadData({ symbol });
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
      this.orderBookWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.orderBookWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }

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
