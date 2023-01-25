import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketTickerStreamParams } from '../models/websocket-ticker-stream-params.model';
import { WebsocketTicker } from '../models/websocket-ticker.model';
import { tickersActions, tickersSelectors } from '../store';
import { TickerEntity } from '../store/tickers.state';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService
  implements WithWebsocket<WebsocketTickerStreamParams, WebsocketTicker>
{
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tickerStatus$ = this.store.select(tickersSelectors.status);

  public websocketSubscriptionId = {
    subscribe: {
      single: 1,
      multiple: 2,
    },
    unsubscribe: {
      single: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 1,
      multiple: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 2,
    },
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketTickerStreamParams>(
      ({ symbols }) => symbols.map((item) => `${item.toLowerCase()}@ticker`)
    );

  public constructor(
    private store: Store<AppState>,
    private websocketSubscribeService: WebsocketSubscribeService
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
            this.subscribeToWebsocket(
              {
                symbols: [symbol],
              },
              this.websocketSubscriptionId.subscribe.single
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

  public subscribeToWebsocket(params: WebsocketTickerStreamParams, id: number) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketTickerStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
