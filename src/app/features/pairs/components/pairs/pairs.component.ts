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
import { Subject, combineLatest, map } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';
import { ChartService } from 'src/app/features/candles/components/chart/chart.service';
import { CandlesFacade } from 'src/app/features/candles/services/candles-facade.service';
import { ExchangeInfoFacade } from 'src/app/features/exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { OrderBookFacade } from 'src/app/features/order-book/services/order-book-facade.service';
import { OrderBookWebsocketService } from 'src/app/features/order-book/services/order-book-websocket.service';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { TickerWebsocketService } from 'src/app/features/ticker/services/ticker-websocket.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TradesFacade } from 'src/app/features/trades/services/trades-facade.service';
import {
  convertPairToCurrency,
  formatPrice,
  getCellByColumnId,
} from 'src/app/shared/helpers';
import { Column } from 'src/app/shared/types/column';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairsStyleService } from '../../services/pairs-style.service';
import { PairColumn } from '../../types/pair-column';
import { LoadingController } from 'src/app/shared/loading-controller';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  styleUrls: ['./pairs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsComponent
  extends LoadingController
  implements OnDestroy, OnInit
{
  @ViewChild(MatPaginator, { static: true }) private paginator!: MatPaginator;

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

  public rows$ = combineLatest([
    this.exchangeInfoFacade.tradingSymbols$,
    this.tickerFacade.tickers$,
  ]).pipe(
    map(([tradingSymbols, tickers]) => this.createRows(tradingSymbols, tickers))
  );

  // array of current page symbols for further websocket subcribe/unsubscribe data
  private pageSymbols$ = this.pageRows$.pipe(
    map((rows) => this.createSymbolsFromRows(this.columns, rows))
  );

  // Exclude globalSymbol because we already subscribed to it
  private pageSymbolsWithoutGlobalSymbol$ = combineLatest([
    this.globalFacade.symbol$.pipe(first()),
    this.pageSymbols$,
  ]).pipe(
    filter(([_globalSymbol, pageSymbols]) => Boolean(pageSymbols.length)),
    map(([globalSymbol, pageSymbols]) =>
      pageSymbols.filter((symbol) => symbol !== globalSymbol)
    )
  );

  private get pageSize() {
    return this.paginator?.pageSize || this.pageSizeOptions[0];
  }

  public get length$() {
    return this.rows$.pipe(map((data) => data.length));
  }

  private get pageRows$() {
    return this.dataSource.connect();
  }

  public constructor(
    private router: Router,
    private location: Location,
    private tickerFacade: TickerFacade,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private websocketService: WebsocketService,
    public pairsStyleService: PairsStyleService,
    private tickerWebsocketService: TickerWebsocketService,
    public globalFacade: GlobalFacade,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private orderBookFacade: OrderBookFacade,
    private chartService: ChartService
  ) {
    // Set loading
    super(true);
  }

  public trackRow(_index: number, _row: Row) {
    return _index;
  }

  public createSymbolsFromRows = (columns: Column[], rows: Row[]) => {
    return rows.map((row) => {
      const pairCell = getCellByColumnId({ columns, id: 'pair', row });

      const { base, quote } = convertPairToCurrency(
        pairCell.value as string,
        '/'
      );

      return `${base}${quote}`;
    });
  };

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
                ? this.pairsStyleService.cellPositiveClass
                : lastPrice < prevLastPrice
                ? this.pairsStyleService.cellNegativeClass
                : ''
              : '',
          },
          {
            value: priceChangePercentFormatted,
            classNames:
              Number(priceChangePercent) > 0
                ? this.pairsStyleService.cellPositiveClass
                : Number(priceChangePercent) < 0
                ? this.pairsStyleService.cellNegativeClass
                : '',
          },
        ]);
      }
    }

    return rows;
  }

  private handlePageChangeDebounced() {
    this.unsubscribeFromPageSymbols();
    this.subscribeToPageSymbols();
  }

  public handleCandlesOnRowClick({
    symbol,
  }: Pick<Parameters<typeof this.candlesFacade.loadData>[0], 'symbol'>) {
    this.chartService.setLoading(true);
    this.candlesFacade.unsubscribeCurrent();

    this.candlesFacade.intervalCurrent$.subscribe((interval) => {
      this.candlesFacade.loadDataAndSubscribe({ symbol, interval });
    });
  }

  public handleOrderBookOnRowClick({
    symbol,
  }: Parameters<typeof this.orderBookFacade.loadData>[0]) {
    this.orderBookFacade.loadData({ symbol });
    this.orderBookFacade.unsubscribeCurrent();
    this.orderBookWebsocketService.subscribe({ symbol });
  }

  public handleTradesOnRowClick({
    symbol,
  }: Parameters<typeof this.tradesFacade.loadData>[0]) {
    this.tradesFacade.unsubscribeCurrent();
    this.tradesFacade.loadDataAndSubscribe({ symbol });
  }

  public changePair({ base, quote }: Currency) {
    if (!base || !quote) return;

    const pair = `${base}_${quote}`;
    const symbol = `${base}${quote}`;

    this.globalFacade.symbol$
      .pipe(
        first(),
        // Dont't change if clicked twtice
        filter((globalSymbol) => globalSymbol !== symbol)
      )
      .subscribe(() => {
        const url = this.router.createUrlTree([pair]).toString();

        // this.pairsService.handleCandlesOnRowClick({ symbol });
        this.handleOrderBookOnRowClick({ symbol });
        // this.pairsService.handleTradesOnRowClick({ symbol });

        this.globalFacade.setCurrency({ base, quote });

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
      const currency = this.getRowCurrency(row);

      this.changePair(currency);
    }
  }

  private getRowCurrency(row: Row) {
    const pairCell = getCellByColumnId({
      columns: this.columns,
      id: 'pair',
      row,
    });

    const { base, quote } = convertPairToCurrency(
      pairCell.value as string,
      '/'
    );

    return { base, quote };
  }

  public handleRowClick(row: Row) {
    this.clickedRow = row;
  }

  public handlePageChange(event: PageEvent) {
    this.pageClicks$.next(event);
  }

  public subscribeToPageSymbols() {
    this.pageSymbolsWithoutGlobalSymbol$.pipe(first()).subscribe((symbols) => {
      this.tickerWebsocketService.subscribePairs({ symbols });
    });
  }

  public unsubscribeFromPageSymbols() {
    this.pageSymbolsWithoutGlobalSymbol$.pipe(first()).subscribe((symbols) => {
      this.tickerWebsocketService.unsubscribePairs({ symbols });
    });
  }

  public ngOnInit(): void {
    // Create paginator before setting dataSource, for optimization
    this.dataSource.paginator = this.paginator;

    // Update data
    this.rows$.subscribe((rows) => {
      this.dataSource.data = rows;
    });

    // Subscribe to ws when page rows are created for the first time
    this.pageSymbols$
      .pipe(
        filter((symbols) => Boolean(symbols.length)),
        first()
      )
      .subscribe(() => {
        // this.pairsService.subscribeToSymbols();
      });

    // Start listening to page changes
    this.pageClicks$.pipe(debounceTime(this.debounceTime)).subscribe(() => {
      this.handlePageChangeDebounced();
    });

    this.websocketService.status$
      .pipe(filter((status) => status === 'open'))
      .subscribe(() => {
        this.subscribeToPageSymbols();
      });

    // Manage loading
    this.rows$.subscribe((rows) => {
      if (rows.length && this.loading) {
        this.setLoading(false);
      }
    });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
