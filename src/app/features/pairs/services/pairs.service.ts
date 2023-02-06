import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  mergeMap,
  Subject,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import { getCellByColumnId, parsePair } from 'src/app/shared/helpers';
import { GlobalService } from 'src/app/shared/services/global.service';
import { Column } from 'src/app/shared/types/column';
import { Row } from 'src/app/shared/types/row';
import { AppState } from 'src/app/store';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesRestService } from '../../candles/services/candles-rest.service';
import { CandlesService } from '../../candles/services/candles.service';
import { OrderBookRestService } from '../../order-book/services/order-book-rest.service';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { OrderBookService } from '../../order-book/services/order-book.service';
import { TickerWebsocketService } from '../../tickers/services/ticker-websocket.service';
import { TradesRestService } from '../../trades/services/trades-rest.service';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { tradesSelectors } from '../../trades/store';

@Injectable({ providedIn: 'root' })
export class PairsService {
  public pageSymbols: string[] = [];

  private tradesStatus$ = this.store$.select(tradesSelectors.status);
  private delay$ = timer(WEBSOCKET_SUBSCRIPTION_DELAY);

  // Exclude globalSymbol because we already subscribed to it
  private pageSymbolsWithoutGlobalSymbol$ =
    this.globalService.globalSymbolCurrent$.pipe(
      map((globalSymbol) =>
        this.pageSymbols.filter((symbol) => symbol !== globalSymbol)
      )
    );

  public constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService,
    private websocketService: WebsocketService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService,
    private candlesService: CandlesService,
    private candlesRestService: CandlesRestService,
    private orderBookService: OrderBookService,
    private orderBookRestService: OrderBookRestService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  public createSymbolsFromRows = (columns: Column[], rows: Row[]) => {
    return rows.map((row) => {
      const pairCell = getCellByColumnId({ columns, id: 'pair', row });
      const { base, quote } = parsePair(pairCell.value as string, '/');

      return `${base}${quote}`;
    });
  };

  public onDataCreate(columns: Column[], pageData$: BehaviorSubject<Row[]>) {
    this.setPageSymbols$(columns, pageData$);
    this.subscribeToPageSymbols();
  }

  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() =>
          this.pageSymbolsWithoutGlobalSymbol$.pipe(
            filter((items) => Boolean(items.length))
          )
        )
      )
      .subscribe(() => {
        this.subscribeToPageSymbols();
      });
  }

  public subscribeToPageSymbols() {
    this.pageSymbolsWithoutGlobalSymbol$.subscribe((symbols) => {
      this.tickerWebsocketService.subscribeToWebsocket(
        { symbols },
        this.tickerWebsocketService.websocketSubscriptionId.subscribe.multiple
      );
    });
  }

  public unsubscribeFromPageSymbols() {
    this.websocketService.openCurrent$
      .pipe(mergeMap(() => this.pageSymbolsWithoutGlobalSymbol$))
      .subscribe((symbols) => {
        this.tickerWebsocketService.unsubscribeFromWebsocket(
          { symbols },
          this.tickerWebsocketService.websocketSubscriptionId.unsubscribe
            .multiple
        );
      });
  }

  public handleCandlesOnRowClick({
    symbol,
  }: Pick<Parameters<typeof this.candlesRestService.loadData>[0], 'symbol'>) {
    this.candlesService.intervalCurrent$.subscribe((interval) => {
      this.candlesService.loadDataAndSubscribe({ symbol, interval }, true);
    });
  }

  public handleOrderBookOnRowClick({
    symbol,
  }: Parameters<typeof this.orderBookRestService.loadData>[0]) {
    combineLatest([
      this.globalService.globalSymbolCurrent$,
      this.websocketService.openCurrent$,
    ])
      .pipe(
        tap(([globalSymbol]) => {
          // Unsubscribe from global symbol first
          this.orderBookWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
            },
            this.orderBookWebsocketService.websocketSubscriptionId.unsubscribe
          );

          this.orderBookRestService.loadData({ symbol });
        }),
        mergeMap(() => {
          return combineLatest([
            this.orderBookService.successUntil$,
            this.delay$,
          ]);
        })
      )
      .subscribe(() => {
        this.orderBookWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.orderBookWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleTradesOnRowClick({
    symbol,
  }: Parameters<typeof this.tradesRestService.loadData>[0]) {
    const stop$ = new Subject<void>();

    combineLatest([
      this.globalService.globalSymbolCurrent$,
      this.websocketService.openCurrent$,
    ])
      .pipe(
        tap(([globalSymbol]) => {
          // Unsubscribe from global symbol first
          this.tradesWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
            },
            this.tradesWebsocketService.websocketSubscriptionId.unsubscribe
          );

          this.tradesRestService.loadData({ symbol });
        }),
        mergeMap(() => {
          const success$ = this.tradesStatus$.pipe(
            filter((status) => status === 'success'),
            takeUntil(stop$)
          );

          return combineLatest([success$, this.delay$]);
        })
      )
      .subscribe(() => {
        stop$.next();

        this.tradesWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public setPageSymbols$(columns: Column[], pageData$: BehaviorSubject<Row[]>) {
    pageData$
      .pipe(
        first(),
        map((data) => this.createSymbolsFromRows(columns, data))
      )
      .subscribe((data) => {
        this.pageSymbols = data;
      });
  }
}
