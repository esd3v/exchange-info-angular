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
import { Column } from 'src/app/shared/types/column';
import { Row } from 'src/app/shared/types/row';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesRestService } from '../../candles/services/candles-rest.service';
import { CandlesWebsocketService } from '../../candles/services/candles-websocket.service';
import { CandlesService } from '../../candles/services/candles.service';
import { candlesSelectors } from '../../candles/store';
import { OrderBookRestService } from '../../order-book/services/order-book-rest.service';
import { OrderBookWebsocketService } from '../../order-book/services/order-book-websocket.service';
import { orderBookSelectors } from '../../order-book/store';
import { TickerWebsocketService } from '../../tickers/services/ticker-websocket.service';
import { TradesRestService } from '../../trades/services/trades-rest.service';
import { TradesWebsocketService } from '../../trades/services/trades-websocket.service';
import { tradesSelectors } from '../../trades/store';

@Injectable({ providedIn: 'root' })
export class PairsService {
  private websocketStatus$ = this.websocketService.status$;
  public pageSymbols: string[] = [];

  private orderBookStatus$ = this.store$.select(orderBookSelectors.status);
  private tradesStatus$ = this.store$.select(tradesSelectors.status);
  private candlesInterval$ = this.store$.select(candlesSelectors.interval);
  private globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  private delay$ = timer(WEBSOCKET_SUBSCRIPTION_DELAY);

  private currentCandlesInterval$ = this.candlesInterval$.pipe(first());

  private currentGlobalSymbol$ = this.globalSymbol$.pipe(
    first(),
    filter(Boolean)
  );

  // Exclude globalSymbol because we already subscribed to it
  private pageSymbolsWithoutGlobalSymbol$ = this.currentGlobalSymbol$.pipe(
    map((globalSymbol) =>
      this.pageSymbols.filter((symbol) => symbol !== globalSymbol)
    )
  );

  private websocketOpened$ = this.websocketStatus$.pipe(
    filter((status) => status === 'open')
  );

  // Don't replace with this.websocketOpened$.pipe(first())
  // because first() should come first
  private currentWebsocketOpened$ = this.websocketStatus$.pipe(
    first(),
    filter((status) => status === 'open')
  );

  public constructor(
    private store$: Store<AppState>,
    private websocketService: WebsocketService,
    private tradesRestService: TradesRestService,
    private tradesWebsocketService: TradesWebsocketService,
    private candlesService: CandlesService,
    private candlesRestService: CandlesRestService,
    private candlesWebsocketService: CandlesWebsocketService,
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
    this.websocketOpened$
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
    this.currentWebsocketOpened$
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
    const stop$ = new Subject<void>();

    combineLatest([this.currentGlobalSymbol$, this.currentCandlesInterval$])
      .pipe(
        tap(([globalSymbol, interval]) => {
          // Unsubscribe from global symbol first
          this.candlesWebsocketService.unsubscribeFromWebsocket(
            {
              symbol: globalSymbol,
              interval,
            },
            this.candlesWebsocketService.websocketSubscriptionId.unsubscribe
          );

          this.candlesRestService.loadData({
            interval,
            symbol,
          });
        }),
        mergeMap(([_globalSymbol, interval]) => {
          const success$ = this.candlesService.status$.pipe(
            filter((status) => status === 'success'),
            takeUntil(stop$)
          );

          return combineLatest([
            success$,
            this.currentWebsocketOpened$,
            this.delay$,
          ]).pipe(map(() => interval));
        })
      )
      .subscribe((interval) => {
        stop$.next();

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
    const stop$ = new Subject<void>();

    combineLatest([this.currentGlobalSymbol$, this.currentWebsocketOpened$])
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
          const success$ = this.orderBookStatus$.pipe(
            filter((status) => status === 'success'),
            takeUntil(stop$)
          );

          return combineLatest([success$, this.delay$]);
        })
      )
      .subscribe(() => {
        stop$.next();

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

    combineLatest([this.currentGlobalSymbol$, this.currentWebsocketOpened$])
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
