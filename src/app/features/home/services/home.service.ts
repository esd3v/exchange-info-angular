import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, filter, first, map, mergeMap, takeUntil } from 'rxjs';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesRestService } from '../../candles/services/candles-rest.service';
import { CandlesWebsocketService } from '../../candles/services/candles-websocket.service';
import { candlesActions, candlesSelectors } from '../../candles/store';
import { ExchangeInfoRestService } from '../../exchange-info/services/exchange-info-rest.service';
import { OrderBookRestService } from '../../order-book/services/order-book-rest.service';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { orderBookActions } from '../../order-book/store';
import { TickerRestService } from '../../tickers/services/ticker-rest.service';
import { TickerWebsocketService } from '../../tickers/services/ticker-websocket.service';
import { TradesRestService } from '../../trades/services/trades-rest.service';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { tradesActions } from '../../trades/store';

@Injectable({ providedIn: 'root' })
export class HomerService {
  private websocketStatus$ = this.websocketService.status$;
  private candlesInterval$ = this.store.select(candlesSelectors.interval);
  private currentCandlesInterval$ = this.candlesInterval$.pipe(first());

  private websocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private store: Store<AppState>,
    private websocketService: WebsocketService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService,
    private candlesRestService: CandlesRestService,
    private candlesWebsocketService: CandlesWebsocketService,
    private orderBookRestService: OrderBookRestService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tickerRestService: TickerRestService,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  public handleExchangeInfoOnAppInit() {
    this.exchangeInfoRestService.loadData();
  }

  public handleTickerOnAppInit(symbol: string) {
    const status$ = this.tickerRestService.loadData();
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
      this.tickerWebsocketService.subscribeToWebsocket(
        {
          symbols: [symbol],
        },
        this.tickerWebsocketService.websocketSubscriptionId.subscribe.single
      );
    });
  }

  public handleCandlesOnAppInit({
    symbol,
  }: Pick<Parameters<typeof candlesActions.load>[0], 'symbol'>) {
    this.currentCandlesInterval$
      .pipe(
        mergeMap((interval) => {
          const status$ = this.candlesRestService.loadData({
            symbol,
            interval,
          });

          const stop$ = status$.pipe(filter((status) => status === 'success'));
          const success$ = status$.pipe(takeUntil(stop$));

          return combineLatest([success$, this.websocketOpened$]).pipe(
            map(() => interval)
          );
        })
      )
      .subscribe((interval) => {
        this.candlesWebsocketService.subscribeToWebsocket(
          {
            interval,
            symbol,
          },
          this.candlesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleTradesOnAppInit({
    symbol,
  }: Pick<Parameters<typeof tradesActions.load>[0], 'symbol'>) {
    const status$ = this.tradesRestService.loadData({ symbol });
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
      this.tradesWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.tradesWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }

  public handleOrderBookOnAppInit({
    symbol,
  }: Pick<Parameters<typeof orderBookActions.load>[0], 'symbol'>) {
    const status$ = this.orderBookRestService.loadData({ symbol });
    const stop$ = status$.pipe(filter((status) => status === 'success'));
    const success$ = status$.pipe(takeUntil(stop$));

    combineLatest([success$, this.websocketOpened$]).subscribe(() => {
      this.orderBookWebsocketService.subscribeToWebsocket(
        {
          symbol,
        },
        this.orderBookWebsocketService.websocketSubscriptionId.subscribe
      );
    });
  }
}
