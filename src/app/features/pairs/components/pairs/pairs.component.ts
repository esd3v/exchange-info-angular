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
import { globalSelector } from 'src/app/features/tickers/store/ticker.selectors';
import { globalSelectors } from 'src/app/store/global';
import { TickerEntity } from 'src/app/features/tickers/store/tickers.state';
import { ExchangeSymbolEntity } from 'src/app/store/symbols/symbols.state';
import { WebsocketMessageIncoming } from 'src/app/websocket/models/websocket-message-incoming.model';
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
  dataSource!: MatTableDataSource<PairRow>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private websocketService: WebsocketService,
    private websocketTickerService: WebsocketTickerService,
    private store: Store<AppState>
  ) {
    this.dataSource = new MatTableDataSource();
  }

  columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public pageSizeOptions = [15];
  public displayedColumns: string[] = this.columns.map((item) => item.id);
  private tickers$ = this.store.select(tickersSelectors.tickers);
  private tradingSymbols$ = this.store.select(symbolsSelectors.tradingSymbols);
  private globalSymbol$ = this.store.select(globalSelectors.globalSymbol);
  private debounceTime = 1000;
  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageClicks$ = new Subject<PageEvent>();
  private subscribedSymbols: string[] = [];

  get length() {
    return this.tradingSymbols$.pipe(map((data) => data.length));
  }

  get pageSize() {
    return this.paginator?.pageSize || this.pageSizeOptions[0];
  }

  get data() {
    return this.dataSource.data;
  }

  set data(rows) {
    this.dataSource.data = rows;
  }

  getCellValue(row: PairRow, columnId: PairColumn['id']) {
    return columnId === 'pair'
      ? `${row.baseAsset}/${row.quoteAsset}`
      : row[columnId];
  }

  handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
    this.pageIndex$.next(event.pageIndex);
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
    const slicedSymbols$ = combineLatest([
      this.tradingSymbols$,
      this.pageIndex$,
    ]).pipe(
      map(([tradingSymbols, pageIndex]) => {
        return getPageSlice({
          page: pageIndex || 0,
          rows: tradingSymbols,
          rowsPerPage: this.pageSize,
        });
      })
    );

    const rows$ = combineLatest([slicedSymbols$, this.tickers$]).pipe(
      map(([slicedSymbols, tickers]) => this.createRows(slicedSymbols, tickers))
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
      if (status === 'open' || status === 'restored') {
        this.subscribeToWebsocket();

        // Start listening to page changes
        this.pageClicks$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
          this.handlePageChangeDebounced();
        });
      }
    });
  }

  ngOnInit(): void {
    this.handleWebsocketStart();
    this.updateDataOnTickersUpdate();
  }

  ngOnDestroy(): void {
    this.pageClicks$.complete();
    this.pageIndex$.complete();
  }
}
