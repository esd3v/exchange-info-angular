import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, filter, first, switchMap } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { GlobalService } from '../../global/services/global.service';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';
import { GlobalTicker } from '../types/global-ticker';
import { WebsocketTicker } from '../types/websocket-ticker';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  #globalPair$ = this.globalService.pair$;

  constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private websocketService: WebsocketService,
  ) {
    this.#globalPair$
      .pipe(
        switchMap((pair) =>
          combineLatest([
            this.store$
              .select(tickerSelectors.lastPrice(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.tickSize(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.prevLastPrice(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.priceChange(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.priceChangePercent(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.lastQuantity(pair.symbol))
              .pipe(filter(Boolean)),
            this.store$
              .select(tickerSelectors.numberOfTrades(pair.symbol))
              .pipe(filter(Boolean)),
          ]),
        ),
      )
      .subscribe(
        ([
          lastPrice,
          tickSize,
          prevLastPrice,
          priceChange,
          priceChangePercent,
          lastQuantity,
          numberOfTrades,
        ]) => {
          this.globalTicker$.next({
            lastPrice,
            lastQuantity,
            numberOfTrades,
            prevLastPrice,
            priceChange,
            priceChangePercent,
            tickSize,
          });
        },
      );
  }

  createStreamParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  singleSubscriber = new WebsocketSubscriber(
    2,
    this.createStreamParams,
    this.websocketSubscribeService,
  );

  multipleSubscriber = new WebsocketSubscriber(
    5,
    this.createStreamParams,
    this.websocketSubscribeService,
  );

  globalTicker$ = new BehaviorSubject<GlobalTicker>(null);

  tickers$ = this.store$.select(tickerSelectors.tickers);

  handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    this.updateTicker({
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    });
  }

  loadData() {
    this.store$.dispatch(tickerActions.load());
  }

  onWebsocketOpen() {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() => this.globalService.pair$.pipe(first())),
      )
      .subscribe((globalPair) => {
        this.singleSubscriber.subscribeToStream({
          symbols: [globalPair.symbol],
        });
      });
  }

  updateTicker(ticker: TickerEntity) {
    this.store$.dispatch(tickerActions.update({ data: ticker }));
  }
}
