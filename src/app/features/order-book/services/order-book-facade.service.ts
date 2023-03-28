import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, timer } from 'rxjs';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { orderBookActions, orderBookSelectors } from '../store';
import { OrderBook } from '../types/order-book';
import { WebsocketOrderBook } from '../types/websocket-order-book';
import { OrderBookWebsocketService } from './order-book-websocket.service';

@Injectable({ providedIn: 'root' })
export class OrderBookFacade {
  private status$ = this.store$.select(orderBookSelectors.status);

  public isLoading$ = this.status$.pipe(
    map((status) => (status === 'init' ? null : status === 'loading'))
  );

  public successCurrent$ = this.status$.pipe(
    first(),
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first()
  );

  public asks$ = this.store$.select(orderBookSelectors.asks);
  public bids$ = this.store$.select(orderBookSelectors.bids);

  public constructor(
    private store$: Store<AppState>,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private orderBookWebsocketService: OrderBookWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof orderBookActions.load>[0], 'symbol'>) {
    this.loadDataAndSubscribe({ symbol }, 0);
  }

  public onWebsocketOpen() {
    combineLatest([
      // Check if data is CURRENTLY loaded
      // to prevent double loading when data loaded AFTER ws opened
      this.successCurrent$,
      this.globalFacade.globalSymbolCurrent$,
    ]).subscribe(([_tickerStatus, symbol]) => {
      this.orderBookWebsocketService.subscribe({ symbol });
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

  public unsubscribeCurrent() {
    combineLatest([
      this.globalFacade.globalSymbolCurrent$,
      this.websocketService.openCurrent$,
    ]).subscribe(([globalSymbol]) => {
      this.orderBookWebsocketService.unsubscribe({ symbol: globalSymbol });
    });
  }

  public loadData({
    symbol,
    limit = WIDGET_DEPTH_DEFAULT_LIMIT,
  }: Parameters<typeof orderBookActions.load>[0]) {
    this.store$.dispatch(orderBookActions.load({ symbol, limit }));
  }

  public loadDataAndSubscribe(
    { symbol }: Parameters<typeof this.loadData>[0],
    delay: number
  ) {
    this.loadData({
      symbol,
    });

    combineLatest([this.successUntil$, timer(delay)]).subscribe(() => {
      if (this.websocketService.status$.getValue() === 'open') {
        this.orderBookWebsocketService.subscribe({ symbol });
      }
    });
  }
}
