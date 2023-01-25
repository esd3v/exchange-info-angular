import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Dictionary } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { combineLatest, interval, map, Subject } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import { CandlesRestService } from 'src/app/features/candles/services/candles-rest.service';
import { CandlesWebsocketService } from 'src/app/features/candles/services/candles-websocket.service';
import { OrderBookRestService } from 'src/app/features/order-book/services/order-book-rest.service';
import { OrderBookWebsocketService } from 'src/app/features/order-book/services/order-book-websocket.service';
import { TickerRestService } from 'src/app/features/tickers/services/ticker-rest.service';
import { tickersSelectors } from 'src/app/features/tickers/store';
import { TickerEntity } from 'src/app/features/tickers/store/tickers.state';
import { TradesRestService } from 'src/app/features/trades/services/trades-rest.service';
import { TradesWebsocketService } from 'src/app/features/trades/services/trades-websocket.service';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import {
  formatDecimal,
  getCellByColumnId,
  parsePair,
} from 'src/app/shared/helpers';
import { Row } from 'src/app/shared/models/row.model';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';
import { symbolsSelectors } from 'src/app/store/symbols';
import { ExchangeSymbolEntity } from 'src/app/store/symbols/symbols.state';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairColumn } from '../../models/pair-column.model';
import { PairsService } from '../../services/pairs.service';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  styleUrls: ['./pairs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsComponent implements OnDestroy, OnInit {
  @ViewChild(MatPaginator, { static: true }) private paginator!: MatPaginator;

  private tickers$ = this.store.select(tickersSelectors.tickers);
  private tradingSymbols$ = this.store.select(symbolsSelectors.tradingSymbols);
  private debounceTime = 1000;
  private pageClicks$ = new Subject<PageEvent>();
  private tickersStatus$ = this.store.select(tickersSelectors.status);
  private tradingSymbolsStatus$ = this.store.select(symbolsSelectors.status);
  public pageSizeOptions = [15];
  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public displayedColumns: string[] = this.columns.map((item) => item.id);

  public placeholderRows = Array<Row>(this.pageSize).fill([
    { value: '' },
    { value: '' },
    { value: '' },
  ]);

  public loading$ = combineLatest([
    this.tickersStatus$,
    this.tradingSymbolsStatus$,
  ]).pipe(
    map(
      ([tickersStatus, tradingSymbolsStatus]) =>
        tickersStatus === 'loading' || tradingSymbolsStatus === 'loading'
    )
  );

  private get pageSize() {
    return this.paginator?.pageSize || this.pageSizeOptions[0];
  }

  public get length() {
    return this.tradingSymbols$.pipe(map((data) => data.length));
  }

  private get pageData$() {
    return this.dataSource.connect();
  }

  public constructor(
    private websocketService: WebsocketService,
    private pairsService: PairsService,
    private tickerRestService: TickerRestService,
    private orderBookRestService: OrderBookRestService,
    private candlesRestService: CandlesRestService,
    private tradesRestService: TradesRestService,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private candlesWebsocketService: CandlesWebsocketService,
    private tradesWebsocketService: TradesWebsocketService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  public trackRow(_index: number, _row: Row) {
    return _index;
  }

  private handlePageChangeDebounced() {
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === 'open') {
        this.pairsService.unsubscribeFromPageSymbols();

        interval(WEBSOCKET_SUBSCRIPTION_DELAY)
          .pipe(first())
          .subscribe(() => {
            this.pairsService.subscribeToPageSymbols(
              this.columns,
              this.pageData$
            );
          });
      }
    });
  }

  private createRows(
    symbols: ExchangeSymbolEntity[],
    tickers: Dictionary<TickerEntity>
  ) {
    const rows: Row[] = [];

    for (const { baseAsset, quoteAsset } of symbols) {
      const symbol = `${baseAsset}${quoteAsset}`;
      const pair = `${baseAsset}/${quoteAsset}`;
      const ticker = tickers[symbol];

      if (ticker) {
        const { lastPrice, priceChangePercent, prevLastPrice } = ticker;
        const dLastPrice = formatDecimal(lastPrice);

        const priceChangePercentFormatted = `${
          Number(priceChangePercent) > 0 ? '+' : ''
        }${priceChangePercent}%`;

        rows.push([
          { value: pair },
          {
            value: dLastPrice,
            className: prevLastPrice
              ? lastPrice > prevLastPrice
                ? 'pairs__cell--positive'
                : lastPrice < prevLastPrice
                ? 'pairs__cell--negative'
                : null
              : null,
          },
          {
            value: priceChangePercentFormatted,
            className:
              Number(priceChangePercent) > 0
                ? 'pairs__cell--positive'
                : Number(priceChangePercent) < 0
                ? 'pairs__cell--negative'
                : null,
          },
        ]);
      }
    }

    return rows;
  }

  public handleRowClick(row: Row) {
    const pairCell = getCellByColumnId({
      columns: this.columns,
      id: 'pair',
      row,
    });

    const { base, quote } = parsePair(pairCell.value as string, '/');

    if (base && quote) {
      const pair = `${base}_${quote}`;
      const symbol = `${base}${quote}`;

      this.pairsService.handleCandlesOnRowClick({ symbol });
      this.pairsService.handleOrderBookOnRowClick({ symbol });
      this.pairsService.handleTradesOnRowClick({ symbol });

      this.store.dispatch(
        globalActions.setCurrency({
          payload: { base, quote },
        })
      );

      this.router.navigate([pair]);
    }
  }

  public handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
  }

  private watchDataUpdate() {
    // Wait for tickers and tradingSymbols to load
    const loadedData$ = combineLatest([
      this.tradingSymbols$,
      this.tickers$,
    ]).pipe(
      filter(
        ([tradingSymbols, tickers]) =>
          Boolean(tradingSymbols.length) && Boolean(Object.keys(tickers).length)
      )
    );

    const createdRows$ = loadedData$.pipe(
      map(([tradingSymbols, tickers]) =>
        this.createRows(tradingSymbols, tickers)
      )
    );

    // Update table data constantly
    createdRows$.subscribe((rows) => {
      this.dataSource.data = rows;
    });

    // Subscribe to ws only once when data is loaded and rows are created
    createdRows$.pipe(first()).subscribe(() => {
      // Get already sliced page data from this.pageData and used it for subscription

      this.websocketService.status$.subscribe((status) => {
        if (status === 'open') {
          this.pairsService.subscribeToPageSymbols(
            this.columns,
            this.pageData$
          );
        }
      });
    });
  }

  public ngOnInit(): void {
    // Create paginator before setting dataSource, for optimization
    this.dataSource.paginator = this.paginator;

    this.watchDataUpdate();

    // Start listening to page changes
    this.pageClicks$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.handlePageChangeDebounced();
    });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
