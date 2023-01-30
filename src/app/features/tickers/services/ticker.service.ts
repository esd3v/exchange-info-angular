import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketTicker } from '../models/websocket-ticker.model';
import { tickersActions, tickersSelectors } from '../store';
import { TickerEntity } from '../store/tickers.state';
import { TickerWebsocketService } from './ticker-websocket.service';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tickerStatus$ = this.store.select(tickersSelectors.status);

  public constructor(
    private tickerWebsocketService: TickerWebsocketService,
    private store: Store<AppState>
  ) {}

  // Runs once when websocket is opened
  // Then subscribe if data is loaded at this moment
  public onWebsocketOpen() {
    this.tickerStatus$
      .pipe(
        first(),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        this.globalSymbol$
          .pipe(first(), filter(Boolean))
          .subscribe((symbol) => {
            this.tickerWebsocketService.subscribeToWebsocket(
              {
                symbols: [symbol],
              },
              this.tickerWebsocketService.websocketSubscriptionId.subscribe
                .single
            );
          });
      });
  }

  public handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    const ticker: TickerEntity = {
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    };

    this.store.dispatch(tickersActions.update({ data: ticker }));
  }
}
