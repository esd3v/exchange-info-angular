import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionary } from '@ngrx/entity';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  debounceTime,
  filter,
  first,
  map,
  switchMap,
} from 'rxjs';
import { ChartService } from 'src/app/features/candles/components/chart/chart.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { OrderBookTableContainerService } from 'src/app/features/order-book/components/order-book-table-container/order-book-table-container.service';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairColumn } from '../../types/pair-column';
import { Currency } from 'src/app/features/global/types/currency';

@Component({
  selector: 'app-pairs-table',
  templateUrl: './pairs-table.component.html',
})
export class PairsTableComponent implements OnDestroy, OnInit {
  get #globalSymbol() {
    return this.globalService.symbol;
  }

  #debounceTime = 1000;

  #pageClicks$ = new Subject<void>();

  #prevPageRows$ = new BehaviorSubject<Row[]>([]);

  #pageRows$ = new BehaviorSubject<Row[]>([]);

  #data$ = combineLatest([
    this.exchangeInfoService.tradingSymbols$,
    this.tickerService.tickers$,
  ]).pipe(
    map(([tradingSymbols, tickers]) =>
      this.createRows(tradingSymbols, tickers, this.#globalSymbol)
    )
  );

  data: Row[] = [];

  pageSizeOptions = [15];

  columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  loadingController = new LoadingController(true);

  constructor(
    private router: Router,
    private location: Location,
    private tickerService: TickerService,
    private tickerRestService: TickerRestService,
    private exchangeInfoService: ExchangeInfoService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private websocketService: WebsocketService,
    private tableStyleService: TableStyleService,
    private globalService: GlobalService,
    private tradesTableService: TradesTableService,
    private chartService: ChartService,
    private orderBookTableContainerService: OrderBookTableContainerService
  ) {}

  // Exclude globalSymbol because we already subscribed to it
  private filterSymbol(symbols: string[], symbol: string) {
    return symbols.filter((item) => item !== symbol);
  }

  createSymbolsFromRows(rows: Row[]) {
    return rows.map((row) => {
      const pairCell = row.cells[0];

      const { base, quote } = convertPairToCurrency(
        pairCell.value as string,
        '/'
      );

      return `${base}${quote}`;
    });
  }

  createRows(
    symbols: ExchangeSymbolEntity[],
    tickers: Dictionary<TickerEntity>,
    globalSymbol: string
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

        rows.push({
          cells: [
            { value: pair },
            {
              value: formattedPrice,
              classNames: prevLastPrice
                ? lastPrice > prevLastPrice
                  ? this.tableStyleService.cellPositiveClass
                  : lastPrice < prevLastPrice
                  ? this.tableStyleService.cellNegativeClass
                  : ''
                : '',
            },
            {
              value: priceChangePercentFormatted,
              classNames:
                Number(priceChangePercent) > 0
                  ? this.tableStyleService.cellPositiveClass
                  : Number(priceChangePercent) < 0
                  ? this.tableStyleService.cellNegativeClass
                  : '',
            },
          ],
          classNames:
            symbol === globalSymbol
              ? this.tableStyleService.rowHighlightClass
              : '',
        });
      }
    }

    return rows;
  }

  private updateWidgetsData() {
    // Set loading manually because of ws delay
    this.tradesTableService.loadingController.setLoading(true);
    this.chartService.loadingController.setLoading(true);
    this.orderBookTableContainerService.loadingController.setLoading(true);

    this.chartService.resubscribeLoadData();
    this.orderBookTableContainerService.resubscribeLoadData();
    this.tradesTableService.resubscribeLoadData();
  }

  setLocation(pair: string) {
    const url = this.router.createUrlTree([pair]).toString();

    // Don't navigate with refresh, just replace url
    this.location.go(url);
  }

  private getRowCurrency(row: Row) {
    const pairCell = row.cells[0];

    const { base, quote } = convertPairToCurrency(
      pairCell.value as string,
      '/'
    );

    return { base, quote };
  }

  subscribeToPageSymbols(symbols: string[]) {
    this.tickerService.multipleSubscriber.subscribe({ symbols });
  }

  unsubscribeFromPageSymbols(symbols: string[]) {
    this.tickerService.multipleSubscriber.unsubscribe({ symbols });
  }

  handleRowClick(row: Row) {
    const { base, quote } = this.getRowCurrency(row);

    if (!base || !quote) return;

    const pair = `${base}_${quote}`;
    const symbol = `${base}${quote}`;

    // Prevent double click
    if (symbol !== this.#globalSymbol) {
      // First set currecy (global symbol)
      this.globalService.setCurrency({ base, quote });
      // Then update order book and trades tables data based on new symbol
      this.updateWidgetsData();
      // And change url
      this.setLocation(pair);
    }
  }

  handlePageDataInit(rows: Row[]) {
    this.#pageRows$.next(rows);
    this.#prevPageRows$.next(rows);
  }

  handlePageChange(rows: Row[]) {
    this.#pageRows$.next(rows);
    this.#pageClicks$.next();
  }

  ngOnInit(): void {
    // Update data
    this.#data$.subscribe((data) => {
      this.data = data;
    });

    // On websocket start
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() =>
          this.#pageRows$.pipe(
            filter((rows) => Boolean(rows.length)),
            first()
          )
        )
      )
      .subscribe((pageRows) => {
        const symbols = this.filterSymbol(
          this.createSymbolsFromRows(pageRows),
          this.#globalSymbol
        );

        this.subscribeToPageSymbols(symbols);
      });

    // On page change debounced
    this.#pageClicks$
      .pipe(
        debounceTime(this.#debounceTime),
        switchMap(() =>
          combineLatest([
            this.#pageRows$.pipe(first()),
            this.#prevPageRows$.pipe(first()),
          ])
        )
      )
      .subscribe(([pageRows, prevPageRows]) => {
        const prevSymbols = this.filterSymbol(
          this.createSymbolsFromRows(prevPageRows),
          this.#globalSymbol
        );

        const symbols = this.filterSymbol(
          this.createSymbolsFromRows(pageRows),
          this.#globalSymbol
        );

        this.unsubscribeFromPageSymbols(prevSymbols);
        this.subscribeToPageSymbols(symbols);

        this.#prevPageRows$.next(pageRows);
      });

    // REST loading
    combineLatest([
      this.tickerRestService.status$.pipe(
        filter((status) => status === 'loading')
      ),
      this.exchangeInfoRestService.status$.pipe(
        filter((status) => status === 'loading')
      ),
    ]).subscribe(() => {
      this.loadingController.setLoading(true);
    });

    // REST and data complete
    combineLatest([
      this.tickerRestService.status$.pipe(
        filter((status) => status === 'success')
      ),
      this.exchangeInfoRestService.status$.pipe(
        filter((status) => status === 'success')
      ),
      this.#data$.pipe(filter((data) => Boolean(data.length))),
    ]).subscribe(() => {
      this.loadingController.setLoading(false);
    });
  }

  ngOnDestroy(): void {
    this.#pageClicks$.complete();
  }
}
