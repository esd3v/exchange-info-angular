import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, mergeMap, Subject } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBook } from '../types/order-book';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBookRestService } from './order-book-rest.service';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookService {
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private websocketStatus$ = this.websocketService.status$;
  private orderBookStatus$ = this.store$.select(orderBookSelectors.status);

  private websocketOpened$ = this.websocketStatus$.pipe(
    filter((status) => status === 'open')
  );

  // Don't replace with this.websocketOpened$.pipe(first())
  // because first() should come first
  private currentWebsocketOpened$ = this.websocketStatus$.pipe(
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
    const stop$ = new Subject<void>();

    const success$ = this.orderBookStatus$.pipe(
      filter((status) => status === 'success')
    );

    this.orderBookRestService.loadData({ symbol });

    combineLatest([success$, this.currentWebsocketOpened$]).subscribe(() => {
      stop$.next();

      this.orderBookWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.orderBookWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }

  public onWebsocketOpen() {
    this.websocketOpened$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.orderBookStatus$.pipe(
              // first() comes first to check if data is CURRENTLY loaded
              // to prevent double loading when data loaded AFTER ws opened
              first(),
              filter((status) => status === 'success')
            ),
            this.globalSymbol$.pipe(first(), filter(Boolean)),
          ]);
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
