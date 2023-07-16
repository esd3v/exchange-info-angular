import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, first } from 'rxjs';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { tradesActions, tradesSelectors } from '../store';
import { WebsocketTrades } from '../types/websocket-trades';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesFacade {
  public restStatus$ = this.store$.select(tradesSelectors.status);
  public trades$ = this.store$.select(tradesSelectors.data);

  public constructor(
    private store$: Store<AppState>,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onWebsocketOpen() {
    combineLatest([
      this.websocketService.reason$.pipe(first()),
      this.globalFacade.symbol$.pipe(first()),
      // Check if data is CURRENTLY loaded
      // to prevent double loading when data loaded AFTER ws opened
      // this.successCurrent$,
    ]).subscribe(([reason, symbol]) => {
      // If we enable ws by switch for the first time or re-enable it
      if (reason === 'switch' || reason === 'restored') {
        this.loadData({ symbol });
      }

      this.tradesWebsocketService.subscribe({ symbol });
    });
  }

  public handleWebsocketData({ p, q, m, T }: WebsocketTrades) {
    this.store$.dispatch(
      tradesActions.addAndRemoveLast({
        trades: {
          price: p,
          qty: q,
          isBuyerMaker: m,
          time: T,
        },
      })
    );
  }

  public unsubscribeCurrent() {
    this.globalFacade.symbol$.pipe(first()).subscribe((globalSymbol) => {
      this.tradesWebsocketService.unsubscribe({
        symbol: globalSymbol,
      });
    });
  }

  public loadData({
    symbol,
    limit = WIDGET_TRADES_DEFAULT_LIMIT,
  }: Parameters<typeof tradesActions.load>[0]) {
    this.store$.dispatch(tradesActions.load({ symbol, limit }));
  }
}
