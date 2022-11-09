import { debounceTime, filter } from 'rxjs/operators';
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
import { Store } from '@ngrx/store';
import { combineLatest, interval, map, Subject, take } from 'rxjs';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';
import { symbolsSelectors } from 'src/app/store/symbols';
import { PairColumn } from '../../models/pair-column.model';
import { WebsocketTickerService } from 'src/app/features/tickers/services/websocket-ticker.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WEBSOCKET_UNSUBSCRIBEDELAY } from 'src/app/shared/config';
import { globalActions, globalSelectors } from 'src/app/store/global';
import { TickerEntity } from 'src/app/features/tickers/store/tickers.state';
import { ExchangeSymbolEntity } from 'src/app/store/symbols/symbols.state';
import { Dictionary } from '@ngrx/entity';
import { Router } from '@angular/router';
import { Row } from 'src/app/shared/models/row.model';
import { formatLastPrice, parsePair } from 'src/app/shared/helpers';

export function getPageSlice<T>({
  page,
  rows,
  rowsPerPage,
}: {
  rows: T[];
  page: number;
  rowsPerPage: number;
}) {
  const rowsPassed = page * rowsPerPage;

  return rows.slice(rowsPassed, rowsPassed + rowsPerPage);
}

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
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private debounceTime = 1000;
  private pageClicks$ = new Subject<PageEvent>();
  private subscribedSymbols: string[] = [];
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
    private websocketTickerService: WebsocketTickerService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  public trackRow(_index: number, _row: Row) {
    return _index;
  }

  private handlePageChangeDebounced() {
    this.unsubscribeFromWebsocket();

    interval(WEBSOCKET_UNSUBSCRIBEDELAY)
      .pipe(take(1))
      .subscribe(() => {
        this.subscribeToWebsocket();
      });
  }

  private subscribeToWebsocket() {
    this.pageData$.pipe(take(1)).subscribe((data) => {
      const symbols$ = this.createSymbolsFromRows(data);

      symbols$.subscribe((symbols) => {
        if (symbols.length) {
          this.subscribedSymbols = symbols;
          this.websocketTickerService.subscribeIndividual({ symbols });
        }
      });
    });
  }

  private unsubscribeFromWebsocket() {
    this.websocketTickerService.unsubscribeIndividual({
      symbols: this.subscribedSymbols,
    });

    this.subscribedSymbols = [];
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

        const priceChangePercentFormatted = `${
          Number(priceChangePercent) > 0 ? '+' : ''
        }${priceChangePercent}%`;

        rows.push([
          { value: pair },
          {
            value: formatLastPrice(lastPrice),
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

  // TODO Move globalSymbol filtering
  private createSymbolsFromRows(rows: Row[]) {
    return this.globalSymbol$.pipe(
      map((globalSymbol) =>
        rows
          .map((row) => {
            const pairCell = this.getCellByColumnId(row, 'pair');
            const { base, quote } = parsePair(pairCell.value as string, '/');

            return `${base}${quote}`;
          })
          .filter((item) => item !== globalSymbol)
      )
    );
  }

  private handleWebsocketStart() {
    this.websocketService.status$.subscribe((status) => {
      if (status === 'open') {
        this.subscribeToWebsocket();

        // Start listening to page changes
        this.pageClicks$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
          this.handlePageChangeDebounced();
        });
      }
    });
  }

  public getCellByColumnId(row: Row, id: PairColumn['id']) {
    const columnId = this.columns.findIndex((item) => item.id === id);

    return row[columnId];
  }

  public handleRowClick(row: Row) {
    const pairCell = this.getCellByColumnId(row, 'pair');
    const { base, quote } = parsePair(pairCell.value as string, '/');

    if (base && quote) {
      const pair = `${base}_${quote}`;

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

  public ngOnInit(): void {
    this.handleWebsocketStart();

    // Create paginator before setting dataSource, for optimization
    this.dataSource.paginator = this.paginator;

    // React to tickers updates
    combineLatest([this.tradingSymbols$, this.tickers$])
      .pipe(
        filter(
          ([tradingSymbols, tickers]) =>
            Boolean(tradingSymbols.length) &&
            Boolean(Object.keys(tickers).length)
        )
      )
      .subscribe(([tradingSymbols, tickers]) => {
        this.dataSource.data = this.createRows(tradingSymbols, tickers);
      });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
