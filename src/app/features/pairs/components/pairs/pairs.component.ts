import { debounceTime } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  interval,
  map,
  Subject,
  take,
} from 'rxjs';
import { AppState } from 'src/app/store';
import { tickersSelectors } from 'src/app/features/tickers/store';
import { symbolsSelectors } from 'src/app/store/symbols';
import { PairColumn } from '../../models/pair-column.model';
import { PairRow } from '../../models/pair-row.model';
import { WebsocketTickerService } from 'src/app/features/tickers/services/websocket-ticker.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WEBSOCKET_UNSUBSCRIBEDELAY } from 'src/app/shared/config';
import { globalSelectors } from 'src/app/store/global';
import { TickerEntity } from 'src/app/features/tickers/store/tickers.state';
import { ExchangeSymbolEntity } from 'src/app/store/symbols/symbols.state';
import { Dictionary } from '@ngrx/entity';

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
})
export class PairsComponent implements OnInit, OnDestroy {
  private tickers$ = this.store.select(tickersSelectors.tickers);
  private tradingSymbols$ = this.store.select(symbolsSelectors.tradingSymbols);
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private debounceTime = 1000;
  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageClicks$ = new Subject<PageEvent>();
  private subscribedSymbols: string[] = [];
  private tickersStatus$ = this.store.select(tickersSelectors.status);
  private tradingSymbolsStatus$ = this.store.select(symbolsSelectors.status);
  public pageSizeOptions = [15];
  public dataSource!: MatTableDataSource<PairRow>;

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public displayedColumns: string[] = this.columns.map((item) => item.id);
  public placeholderRows = Array(this.pageSize);

  public loading$ = combineLatest([
    this.tickersStatus$,
    this.tradingSymbolsStatus$,
  ]).pipe(
    map(
      ([tickersStatus, tradingSymbolsStatus]) =>
        tickersStatus === 'loading' || tradingSymbolsStatus === 'loading'
    )
  );

  @ViewChild(MatPaginator) private paginator!: MatPaginator;

  private get pageSize() {
    return this.paginator?.pageSize || this.pageSizeOptions[0];
  }

  public get length() {
    return this.tradingSymbols$.pipe(map((data) => data.length));
  }

  private get data() {
    return this.dataSource.data;
  }

  private set data(rows) {
    this.dataSource.data = rows;
  }

  public constructor(
    private websocketService: WebsocketService,
    private websocketTickerService: WebsocketTickerService,
    private store: Store<AppState>
  ) {
    this.dataSource = new MatTableDataSource();
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
    const symbols$ = this.createSymbolsFromRows(this.data);

    symbols$.subscribe((symbols) => {
      this.subscribedSymbols = symbols;
      this.websocketTickerService.subscribeIndividual({ symbols });
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
    const rows: PairRow[] = [];

    for (const { baseAsset, quoteAsset } of symbols) {
      const symbol = `${baseAsset}${quoteAsset}`;
      const ticker = tickers[symbol];

      if (ticker) {
        const { lastPrice, priceChangePercent } = ticker;

        rows.push({
          baseAsset,
          quoteAsset,
          lastPrice,
          priceChangePercent,
        });
      }
    }

    return rows;
  }

  private updateDataOnTickersUpdate() {
    const rows$ = combineLatest([
      this.tradingSymbols$,
      this.tickers$,
      this.pageIndex$,
    ]).pipe(
      map(([tradingSymbols, tickers, pageIndex]) => {
        const pageSymbols = getPageSlice({
          page: pageIndex || 0,
          rows: tradingSymbols,
          rowsPerPage: this.pageSize,
        });

        return this.createRows(pageSymbols, tickers);
      })
    );

    rows$.subscribe((rows) => {
      this.data = rows;
    });
  }

  private createSymbolsFromRows(rows: PairRow[]) {
    return this.globalSymbol$.pipe(
      map((globalSymbol) =>
        rows
          .map(({ baseAsset, quoteAsset }) => `${baseAsset}${quoteAsset}`)
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

  public getCellValue(row: PairRow, columnId: PairColumn['id']) {
    return columnId === 'pair'
      ? `${row.baseAsset}/${row.quoteAsset}`
      : row[columnId];
  }

  public handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
    this.pageIndex$.next(event.pageIndex);
  }

  public ngOnInit(): void {
    this.handleWebsocketStart();
    this.updateDataOnTickersUpdate();
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
    this.pageIndex$.complete();
  }
}
