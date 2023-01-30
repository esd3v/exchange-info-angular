import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, filter } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketTrades } from '../models/websocket-trades.model';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';
import { TradesWebsocketService } from './trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tradesStatus$ = this.store.select(tradesSelectors.status);

  public constructor(
    private store: Store<AppState>,
    private tradesWebsocketService: TradesWebsocketService
  ) {}

  public onWebsocketOpen() {
    this.tradesStatus$
      .pipe(
        first(),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        this.globalSymbol$
          .pipe(first(), filter(Boolean))
          .subscribe((symbol) => {
            this.tradesWebsocketService.subscribeToWebsocket(
              {
                symbol,
              },
              this.tradesWebsocketService.websocketSubscriptionId.subscribe
            );
          });
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
