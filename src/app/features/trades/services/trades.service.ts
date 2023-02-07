import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, mergeMap } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalService } from '../../global/services/global.service';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { WebsocketTrades } from '../types/websocket-trades';
import { TradesRestService } from './trades-rest.service';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
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
    private globalService: GlobalService,
    private websocketService: WebsocketService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onAppInit({
    symbol,
  }: Pick<Parameters<typeof tradesActions.load>[0], 'symbol'>) {
    this.tradesRestService.loadData({ symbol });

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
            this.globalService.globalSymbolCurrent$,
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
}
