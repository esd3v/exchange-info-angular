import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, mergeMap, Subject } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTrades } from '../types/websocket-trades';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { TradesRestService } from './trades-rest.service';
import { TradesWebsocketService } from './trades-websocket.service';
import { GlobalService } from 'src/app/shared/services/global.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private tradesStatus$ = this.store$.select(tradesSelectors.status);

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
    const stop$ = new Subject<void>();

    const success$ = this.tradesStatus$.pipe(
      filter((status) => status === 'success')
    );

    this.tradesRestService.loadData({ symbol });

    combineLatest([success$, this.websocketService.openCurrent$]).subscribe(
      () => {
        stop$.next();

        this.tradesWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      }
    );
  }

  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() => {
          return combineLatest([
            this.tradesStatus$.pipe(
              // first() comes first to check if data is CURRENTLY loaded
              // to prevent double loading when data loaded AFTER ws opened
              first(),
              filter((status) => status === 'success')
            ),
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
