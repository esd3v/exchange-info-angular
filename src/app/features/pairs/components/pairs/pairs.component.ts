import { Location } from '@angular/common';
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
import { ExchangeInfoFacade } from 'src/app/features/exchange-info/services/exchange-info-facade.service';
import { globalActions } from 'src/app/features/global/store';
import { symbolsSelectors } from 'src/app/features/symbols/store';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import {
  formatPrice,
  getCellByColumnId,
  parsePair,
} from 'src/app/shared/helpers';
import { Row } from 'src/app/shared/types/row';
import { AppState } from 'src/app/store';
import { PairsService } from '../../services/pairs.service';
import { PairColumn } from '../../types/pair-column';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  styleUrls: ['./pairs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsComponent implements OnDestroy, OnInit {
  @ViewChild(MatPaginator, { static: true }) private paginator!: MatPaginator;

  public tableClass = 'pairs';
  public rowClass = `${this.tableClass}__row`;
  public cellClass = `${this.tableClass}__cell`;
  public cellPositiveClass = `${this.cellClass}--positive`;
  public cellNegativeClass = `${this.cellClass}--negative`;
  public cellRightClass = `${this.cellClass}--alignedRight`;

  public globalSymbol$ = this.globalFacade.globalSymbol$;
  private tradingSymbols$ = this.store$.select(symbolsSelectors.tradingSymbols);
  private debounceTime = 1000;
  private pageClicks$ = new Subject<PageEvent>();
  public clickedRow: Row = [];
  public pageSizeOptions = [15];
  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public displayedColumns: string[] = this.columns.map((item) => item.id);

  public placeholderRows = Array<Row>(this.pageSize).fill([]);

  public loading$ = combineLatest([
    this.tickerFacade.isLoading$,
    this.exchangeInfoFacade.isLoading$,
    this.websocketService.status$,
  ]).pipe(
    map(
      ([tickerLoading, exchangeInfoLoading, websocketStatus]) =>
        tickerLoading || exchangeInfoLoading || websocketStatus === 'connecting'
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
    private tickerFacade: TickerFacade,
    private store$: Store<AppState>,
    private location: Location,
    private router: Router,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private websocketService: WebsocketService,
    private globalFacade: GlobalFacade
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

  public createRows(
    symbols: ExchangeSymbolEntity[],
    tickers: Dictionary<TickerEntity>
  ) {
    const rows: Row[] = [];

    for (const {
      baseAsset,
      quoteAsset,
      PRICE_FILTER: { tickSize },
    } of symbols) {
      const symbol = `${baseAsset}${quoteAsset}`;
      const pair = `${baseAsset}/${quoteAsset}`;
      const ticker = tickers[symbol];

      if (ticker) {
        const { lastPrice, priceChangePercent, prevLastPrice } = ticker;
        const formattedPrice = formatPrice(lastPrice, tickSize);

        const priceChangePercentFormatted = `${
          Number(priceChangePercent) > 0 ? '+' : ''
        }${priceChangePercent}%`;

        rows.push([
          { value: pair },
          {
            value: formattedPrice,
            classNames: prevLastPrice
              ? lastPrice > prevLastPrice
                ? this.cellPositiveClass
                : lastPrice < prevLastPrice
                ? this.cellNegativeClass
                : ''
              : '',
          },
          {
            value: priceChangePercentFormatted,
            classNames:
              Number(priceChangePercent) > 0
                ? this.cellPositiveClass
                : Number(priceChangePercent) < 0
                ? this.cellNegativeClass
                : '',
          },
        ]);
      }
    }

    return rows;
  }

  private parseRow(row: Row) {
    const pairCell = getCellByColumnId({
      columns: this.columns,
      id: 'pair',
      row,
    });

    const { base, quote } = parsePair(pairCell.value as string, '/');

    return { base, quote };
  }

  public changePair(row: Row) {
    const { base, quote } = this.parseRow(row);

    if (!base || !quote) return;

    const pair = `${base}_${quote}`;
    const symbol = `${base}${quote}`;

    this.globalSymbol$
      .pipe(
        first(),
        // Dont't change if clicked twtice
        filter((globalSymbol) => globalSymbol !== symbol)
      )
      .subscribe(() => {
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
      });
  }

  public handleTableClick(event: MouseEvent) {
    const row = this.clickedRow;
    const target: any = event.target;

    if (!target) return;

    const tagName = target.tagName;

    if (tagName === 'TD' && row) {
      this.changePair(row);
    }
  }

  public handleRowClick(row: Row) {
    this.clickedRow = row;
  }

  public handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
  }

  private onTradingSymbolsAndTikersChange() {
    // Wait for tickers and tradingSymbols to load
    const createdRows$ = combineLatest([
      this.tradingSymbols$,
      this.tickerFacade.tickers$,
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
