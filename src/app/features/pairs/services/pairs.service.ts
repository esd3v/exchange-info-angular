import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  filter,
  first,
  map,
  Subject,
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
  public subscribedSymbols: string[] = [];
  private candlesInterval$ = this.store.select(candlesSelectors.interval);
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);

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
    const symbols$ = this.createSymbolsFromCurrentPageRows$(
      columns,
      pageData$
    ).pipe(filter((symbols) => Boolean(symbols.length)));

    this.globalSymbol$
      .pipe(first(), filter(Boolean))
      .subscribe((globalSymbol) => {
        symbols$
          .pipe(
            // Exclude globalSymbol because we already subscribed to it
            map((symbols) =>
              symbols.filter((symbol) => symbol !== globalSymbol)
            )
          )
          .subscribe((symbols) => {
            this.subscribedSymbols = symbols;

            this.tickerWebsocketService.subscribeToWebsocket(
              { symbols },
              this.tickerWebsocketService.websocketSubscriptionId.subscribe
                .multiple
            );
          });
      });
  }

  public unsubscribeFromPageSymbols() {
    console.log('this.subscribedSymbols', this.subscribedSymbols);

    this.globalSymbol$
      .pipe(first(), filter(Boolean))
      .subscribe((globalSymbol) => {
        this.tickerWebsocketService.unsubscribeFromWebsocket(
          {
            symbols: this.subscribedSymbols.filter(
              (symbol) => symbol !== globalSymbol
            ),
          },
          this.tickerWebsocketService.websocketSubscriptionId.unsubscribe
            .multiple
        );

        this.subscribedSymbols = [];
      });
  }

  public handleCandlesOnRowClick({
    symbol,
  }: Pick<Parameters<typeof this.candlesRestService.loadData>[0], 'symbol'>) {
    const stop$ = new Subject<void>();

    this.candlesInterval$.pipe(first()).subscribe((interval) => {
      this.globalSymbol$.pipe(first(), filter(Boolean)).subscribe((symbol) => {
        this.websocketStatus$
          .pipe(
            first(),
            filter((status) => status === 'open')
          )
          .subscribe(() => {
            this.candlesWebsocketService.unsubscribeFromWebsocket(
              {
                symbol,
                interval,
              },
              this.candlesWebsocketService.websocketSubscriptionId.unsubscribe
            );
          });
      });

      this.candlesRestService
        .loadData({ interval, symbol })
        .pipe(
          takeUntil(stop$),
          filter((status) => status === 'success')
        )
        .subscribe(() => {
          this.websocketStatus$
            .pipe(
              first(),
              filter((status) => status === 'open')
            )
            .subscribe(() => {
              stop$.next();

              timer(WEBSOCKET_SUBSCRIPTION_DELAY).subscribe(() => {
                this.candlesWebsocketService.subscribeToWebsocket(
                  {
                    symbol,
                    interval,
                  },
                  this.candlesWebsocketService.websocketSubscriptionId.subscribe
                );
              });
            });
        });
    });
  }

  public handleOrderBookOnRowClick({
    symbol,
  }: Parameters<typeof this.orderBookRestService.loadData>[0]) {
    const stop$ = new Subject<void>();

    this.globalSymbol$.pipe(first(), filter(Boolean)).subscribe((symbol) => {
      this.websocketStatus$
        .pipe(
          first(),
          filter((status) => status === 'open')
        )
        .subscribe(() => {
          this.orderBookWebsocketService.unsubscribeFromWebsocket(
            {
              symbol,
            },
            this.orderBookWebsocketService.websocketSubscriptionId.unsubscribe
          );
        });
    });

    this.orderBookRestService
      .loadData({ symbol })
      .pipe(
        takeUntil(stop$),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        this.websocketStatus$
          .pipe(
            first(),
            filter((status) => status === 'open')
          )
          .subscribe(() => {
            stop$.next();

            timer(WEBSOCKET_SUBSCRIPTION_DELAY).subscribe(() => {
              this.orderBookWebsocketService.subscribeToWebsocket(
                {
                  symbol,
                },
                this.orderBookWebsocketService.websocketSubscriptionId.subscribe
              );
            });
          });
      });
  }

  public handleTradesOnRowClick({
    symbol,
  }: Parameters<typeof this.tradesRestService.loadData>[0]) {
    const stop$ = new Subject<void>();
    const globalSymbol$ = this.globalSymbol$.pipe(first(), filter(Boolean));

    const openedWebsocket$ = this.websocketStatus$.pipe(
      first(),
      filter((status) => status === 'open')
    );

    globalSymbol$.subscribe((symbol) => {
      openedWebsocket$.subscribe(() => {
        this.tradesWebsocketService.unsubscribeFromWebsocket(
          {
            symbol,
          },
          this.tradesWebsocketService.websocketSubscriptionId.unsubscribe
        );
      });
    });

    this.tradesRestService
      .loadData({ symbol })
      .pipe(
        takeUntil(stop$),
        filter((status) => status === 'success')
      )
      .subscribe(() => {
        stop$.next();

        openedWebsocket$.subscribe(() => {
          timer(WEBSOCKET_SUBSCRIPTION_DELAY).subscribe(() => {
            this.tradesWebsocketService.subscribeToWebsocket(
              {
                symbol,
              },
              this.tradesWebsocketService.websocketSubscriptionId.subscribe
            );
          });
        });
      });
  }
}
