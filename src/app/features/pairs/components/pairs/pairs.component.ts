import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Location } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Dictionary } from '@ngrx/entity';
import { Store } from '@ngrx/store';
import { combineLatest, interval, map, Subject } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import { tickersSelectors } from 'src/app/features/tickers/store';
import { TickerEntity } from 'src/app/features/tickers/store/tickers.state';
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

  private tickers$ = this.store$.select(tickersSelectors.tickers);
  private tradingSymbols$ = this.store$.select(symbolsSelectors.tradingSymbols);
  private debounceTime = 1000;
  private pageClicks$ = new Subject<PageEvent>();
  private tickersStatus$ = this.store$.select(tickersSelectors.status);
  private tradingSymbolsStatus$ = this.store$.select(symbolsSelectors.status);
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

  public get length$() {
    return this.tradingSymbols$.pipe(map((data) => data.length));
  }

  private get pageData$() {
    return this.dataSource.connect();
  }

  public constructor(
    private pairsService: PairsService,
    private store$: Store<AppState>,
    private location: Location,
    private router: Router
  ) {}

  public trackRow(_index: number, _row: Row) {
    return _index;
  }

  private handlePageChangeDebounced() {
    this.pairsService.unsubscribeFromPageSymbols();

    interval(WEBSOCKET_SUBSCRIPTION_DELAY)
      .pipe(first())
      .subscribe(() => {
        this.pairsService.setPageSymbols$(this.columns, this.pageData$);
        this.pairsService.subscribeToPageSymbols();
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

    if (!base || !quote) return;

    const pair = `${base}_${quote}`;
    const symbol = `${base}${quote}`;
    const url = this.router.createUrlTree([pair]).toString();

    this.pairsService.handleCandlesOnRowClick({ symbol });
    this.pairsService.handleOrderBookOnRowClick({ symbol });
    this.pairsService.handleTradesOnRowClick({ symbol });

    this.store$.dispatch(
      globalActions.setCurrency({
        payload: { base, quote },
      })
    );

    // Don't navigate with refresh, just replace url
    this.location.go(url);
  }

  public handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
  }

  private onTradingSymbolsAndTikersChange() {
    // Wait for tickers and tradingSymbols to load
    const createdRows$ = combineLatest([
      this.tradingSymbols$,
      this.tickers$,
    ]).pipe(
      map(([tradingSymbols, tickers]) =>
        this.createRows(tradingSymbols, tickers)
      )
    );

    // Update table data constantly
    createdRows$.subscribe((rows) => {
      this.dataSource.data = rows;
    });

    // Subscribe to ws only when page rows are created for the first time
    this.pageData$
      .pipe(
        filter((data) => Boolean(data.length)),
        first() //Must be last. Don't change the order
      )
      .subscribe(() => {
        this.pairsService.onDataCreate(this.columns, this.pageData$);
      });
  }

  public ngOnInit(): void {
    // Create paginator before setting dataSource, for optimization
    this.dataSource.paginator = this.paginator;

    this.onTradingSymbolsAndTikersChange();

    // Start listening to page changes
    this.pageClicks$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.handlePageChangeDebounced();
    });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
