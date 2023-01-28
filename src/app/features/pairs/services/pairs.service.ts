import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  mergeMap,
  takeUntil,
  timer,
} from 'rxjs';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import { getCellByColumnId, parsePair } from 'src/app/shared/helpers';
import { Column } from 'src/app/shared/models/column';
import { Row } from 'src/app/shared/models/row.model';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesRestService } from '../../candles/services/candles-rest.service';
import { CandlesWebsocketService } from '../../candles/services/candles-websocket.service';
import { candlesSelectors } from '../../candles/store';
import { OrderBookRestService } from '../../order-book/services/order-book-rest.service';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { TickerWebsocketService } from '../../tickers/services/ticker-websocket.service';
import { TradesRestService } from '../../trades/services/trades-rest.service';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';

@Injectable({ providedIn: 'root' })
export class PairsService {
  private websocketStatus$ = this.websocketService.status$;
  public pageSymbols: string[] = [];
  private candlesInterval$ = this.store.select(candlesSelectors.interval);
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private delay$ = timer(WEBSOCKET_SUBSCRIPTION_DELAY);

  private currentCandlesInterval$ = this.candlesInterval$.pipe(first());

  private currentGlobalSymbol$ = this.globalSymbol$.pipe(
    first(),
    filter(Boolean)
  );

  private currentWebsocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private store: Store<AppState>,
    private websocketService: WebsocketService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService,
    private candlesRestService: CandlesRestService,
    private candlesWebsocketService: CandlesWebsocketService,
    private orderBookRestService: OrderBookRestService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  private createSymbolsFromRows = (columns: Column[], rows: Row[]) => {
    return rows.map((row) => {
      const pairCell = getCellByColumnId({ columns, id: 'pair', row });
      const { base, quote } = parsePair(pairCell.value as string, '/');

      return `${base}${quote}`;
    });
  };

  private createSymbolsFromCurrentPageRows$(
    columns: Column[],
    pageData$: BehaviorSubject<Row[]>
  ) {
    return pageData$.pipe(
      first(),
      map((rows) => this.createSymbolsFromRows(columns, rows))
    );
  }

  public subscribeToPageSymbols(
    columns: Column[],
    pageData$: BehaviorSubject<Row[]>
  ) {
    const pageSymbols$ = this.createSymbolsFromCurrentPageRows$(
      columns,
      pageData$
    ).pipe(filter((symbols) => Boolean(symbols.length)));

    // Save page symbols for this page
    // To unsubscribe from them on the next page
    pageSymbols$.subscribe((pageSymbols) => {
      this.pageSymbols = pageSymbols;
    });

    // Exclude globalSymbol because we already subscribed to it
    const pageSymbolsWithoutGlobalSymbol$ = combineLatest([
      pageSymbols$,
      this.currentGlobalSymbol$,
    ]).pipe(
      map(([pageSymbols, globalSymbol]) =>
        pageSymbols.filter((symbol) => symbol !== globalSymbol)
      )
    );

    pageSymbolsWithoutGlobalSymbol$.subscribe((symbols) => {
      this.tickerWebsocketService.subscribeToWebsocket(
        { symbols },
        this.tickerWebsocketService.websocketSubscriptionId.subscribe.multiple
      );
    });
  }

  public unsubscribeFromPageSymbols() {
    // Exclude globalSymbol because we already subscribed to it
    const pageSymbolsWithoutGlobalSymbol$ = this.currentGlobalSymbol$.pipe(
      map((globalSymbol) =>
        this.pageSymbols.filter((symbol) => symbol !== globalSymbol)
      )
    );

    pageSymbolsWithoutGlobalSymbol$.subscribe((symbols) => {
      this.tickerWebsocketService.unsubscribeFromWebsocket(
        { symbols },
        this.tickerWebsocketService.websocketSubscriptionId.unsubscribe.multiple
      );
    });
  }

  public handleCandlesOnRowClick({
    symbol,
  }: Pick<Parameters<typeof this.candlesRestService.loadData>[0], 'symbol'>) {
    combineLatest([this.currentGlobalSymbol$, this.currentCandlesInterval$])
      .pipe(
        mergeMap(([globalSymbol, interval]) => {
          // Unsubscribe from global symbol first
          this.candlesWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
              interval,
            },
            this.candlesWebsocketService.websocketSubscriptionId.unsubscribe
          );

          // Load data and get status
          const status$ = this.candlesRestService.loadData({
            interval,
            symbol,
          });

          const stop$ = status$.pipe(filter((status) => status === 'success'));
          const success$ = status$.pipe(takeUntil(stop$));

          return combineLatest([
            success$,
            this.currentWebsocketOpened$,
            this.delay$,
          ]).pipe(map(() => interval));
        })
      )

      .subscribe((interval) => {
        this.candlesWebsocketService.subscribeToWebsocket(
          {
            symbol,
            interval,
          },
          this.candlesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }

  public handleOrderBookOnRowClick({
    symbol,
  }: Parameters<typeof this.orderBookRestService.loadData>[0]) {
    combineLatest([this.currentGlobalSymbol$, this.currentWebsocketOpened$])
      .pipe(
        mergeMap(([globalSymbol]) => {
          // Unsubscribe from global symbol first
          this.orderBookWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
            },
            this.orderBookWebsocketService.websocketSubscriptionId.unsubscribe
          );

          // Load data and get status
          const status$ = this.orderBookRestService.loadData({ symbol });
          const stop$ = status$.pipe(filter((status) => status === 'success'));
          const success$ = status$.pipe(takeUntil(stop$));

          return combineLatest([success$, this.delay$]);
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
    combineLatest([this.currentGlobalSymbol$, this.currentWebsocketOpened$])
      .pipe(
        mergeMap(([globalSymbol]) => {
          // Unsubscribe from global symbol first
          this.tradesWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
            },
            this.tradesWebsocketService.websocketSubscriptionId.unsubscribe
          );

          // Load data and get status
          const status$ = this.tradesRestService.loadData({ symbol });
          const stop$ = status$.pipe(filter((status) => status === 'success'));
          const success$ = status$.pipe(takeUntil(stop$));

          return combineLatest([success$, this.delay$]);
        })
      )
      .subscribe(() => {
        this.tradesWebsocketService.subscribeToWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.subscribe
        );
      });
  }
}
