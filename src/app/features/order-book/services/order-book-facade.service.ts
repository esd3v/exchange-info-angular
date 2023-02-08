import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, mergeMap } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { OrderBookRestService } from './order-book-rest.service';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  private status$ = this.store$.select(orderBookSelectors.status);

  public isLoading$ = this.status$.pipe(map((status) => status === 'loading'));

  public successCurrent$ = this.status$.pipe(
    first(), // Order shouldn't be changed
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first() // Order shouldn't be changed
  );

  public asks$ = this.store$.select(orderBookSelectors.asks);
  public bids$ = this.store$.select(orderBookSelectors.bids);

  public constructor(
    private store$: Store<AppState>,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private orderBookRestService: OrderBookRestService,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof orderBookActions.load>[0], 'symbol'>) {
    this.orderBookRestService.loadData({ symbol });

    combineLatest([
      this.successUntil$,
      this.websocketService.openCurrent$,
    ]).subscribe(() => {
      this.orderBookWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.orderBookWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }

  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            // Check if data is CURRENTLY loaded
            // to prevent double loading when data loaded AFTER ws opened
            this.successCurrent$,
            this.globalFacade.globalSymbolCurrent$,
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
