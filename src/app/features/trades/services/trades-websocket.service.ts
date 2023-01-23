import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WithWebsocket } from 'src/app/shared/types/with-websocket';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketTradesStreamParams } from '../models/websocket-trades-stream-params.model';
import { WebsocketTrades } from '../models/websocket-trades.model';
import { tradesActions, tradesSelectors } from '../store';
import { TradesEntity } from '../store/trades.state';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService
  implements WithWebsocket<WebsocketTradesStreamParams, WebsocketTrades>
{
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private tradesStatus$ = this.store.select(tradesSelectors.status);

  public websocketSubscriptionId = {
    subscribe: 3,
    unsubscribe: WEBSOCKET_UNSUBSCRIBE_BASE_ID + 3,
  };

  public websocketSubscription =
    this.websocketSubscribeService.createSubscription<WebsocketTradesStreamParams>(
      ({ symbol }) => [`${symbol.toLowerCase()}@trade`]
    );

  public constructor(
    private store: Store<AppState>,
    private websocketSubscribeService: WebsocketSubscribeService
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
            this.subscribeToWebsocket(
              {
                symbol,
              },
              this.websocketSubscriptionId.subscribe
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

  public subscribeToWebsocket(params: WebsocketTradesStreamParams, id: number) {
    this.websocketSubscribeService.subscribe(
      this.websocketSubscription(params, id)
    );
  }

  public unsubscribeFromWebsocket(
    params: WebsocketTradesStreamParams,
    id: number
  ) {
    this.websocketSubscribeService.unsubscribe(
      this.websocketSubscription(params, id)
    );
  }
}
