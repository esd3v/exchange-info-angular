import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, mergeMap, timer } from 'rxjs';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { WebsocketTrades } from '../types/websocket-trades';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesFacade {
  private status$ = this.store$.select(tradesSelectors.status);

  public successCurrent$ = this.status$.pipe(
    first(), // Order shouldn't be changed
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first() // Order shouldn't be changed
  );

  public isLoading$ = this.status$.pipe(map((status) => status === 'loading'));

  public trades$ = this.store$.select(tradesSelectors.data);

  public constructor(
    private store$: Store<AppState>,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof tradesActions.load>[0], 'symbol'>) {
    this.loadData({ symbol });

    combineLatest([
      this.successUntil$,
      this.websocketService.openCurrent$,
    ]).subscribe(() => {
      this.tradesWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.tradesWebsocketService.websocketSubscriptionId.subscribe
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

    this.store$.dispatch(tradesActions.add({ trades }));
    this.store$.dispatch(tradesActions.removeLast());
  }

  public loadDataAndSubscribe(
    { symbol }: Parameters<typeof this.loadData>[0],
    delay: number
  ) {
    this.loadData({ symbol });

    combineLatest([this.websocketService.openCurrent$, timer(delay)]).subscribe(
      () => {
        this.tradesWebsocketService.subscribeToWebsocket(
          { symbol },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      }
    );
  }

  public unsubscribeCurrent() {
    combineLatest([
      this.globalFacade.globalSymbolCurrent$,
      this.websocketService.openCurrent$,
    ]).subscribe(([globalSymbol]) => {
      this.tradesWebsocketService.unsubscribeFromWebsocket(
        {
          symbol: globalSymbol,
        },
        this.tradesWebsocketService.websocketSubscriptionId.unsubscribe
      );
    });
  }

  public loadData({
    symbol,
    limit = WIDGET_TRADES_DEFAULT_LIMIT,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }
}
