import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Dictionary } from '@ngrx/entity';
import { Subject, combineLatest, debounceTime, filter, first, map } from 'rxjs';
import { ChartService } from 'src/app/features/candles/components/chart/chart.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { OrderBookTablesService } from 'src/app/features/order-book/components/order-book-tables/order-book-tables.service';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { Row } from '../../../../shared/table/types/row';
import { PairColumn } from '../../types/pair-column';
import { PairsTableStyleService } from './pairs-table-style.service';

@Component({
  selector: 'app-pairs-table',
  styleUrls: ['./pairs-table.component.scss'],
  templateUrl: './pairs-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent implements OnDestroy, OnInit {
  get #globalSymbol() {
    return this.globalService.symbol;
  }

  #debounceTime = 1000;

  #nextPageRows$ = new Subject<Row[]>();

  #data$ = combineLatest([
    this.exchangeInfoService.tradingSymbols$,
    this.tickerService.tickers$,
  ]).pipe(
    map(([tradingSymbols, tickers]) =>
      this.#createRows(tradingSymbols, tickers, this.#globalSymbol)
    )
  );

  data: Row[] = [];

  pageSizeOptions = [15];

  columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  styles = this.pairsTableStyleService;

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
    private orderBookTablesService: OrderBookTablesService,
    private pairsTableStyleService: PairsTableStyleService
  ) {}

  #createPageSymbols(rows: Row[]) {
    return rows.map((row) => {
      const pairCell = row.cells[0];

      const { base, quote } = convertPairToCurrency(
        pairCell.value as string,
        '/'
      );

      return `${base}${quote}`;
    });
  }

  // Exclude globalSymbol because we already subscribed to it
  #createFilteredPageSymbols(rows: Row[]) {
    const symbols = this.#createPageSymbols(rows);

    return symbols.filter((item) => item !== this.#globalSymbol);
  }

  #createRows(
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
              classNames: [
                prevLastPrice
                  ? lastPrice > prevLastPrice
                    ? this.tableStyleService.cellPositiveClass
                    : lastPrice < prevLastPrice
                    ? this.tableStyleService.cellNegativeClass
                    : ''
                  : '',
              ],
            },
            {
              value: priceChangePercentFormatted,
              classNames: [
                Number(priceChangePercent) > 0
                  ? this.tableStyleService.cellPositiveClass
                  : Number(priceChangePercent) < 0
                  ? this.tableStyleService.cellNegativeClass
                  : '',
              ],
            },
          ],
          classNames: [
            this.pairsTableStyleService.rowClass,
            symbol === globalSymbol
              ? this.tableStyleService.rowHighlightClass
              : '',
          ],
        });
      }
    }

    return rows;
  }

  #updateWidgetsData() {
    // Set loading manually because of ws delay
    this.tradesTableService.loadingController.setLoading(true);
    this.chartService.loadingController.setLoading(true);
    this.orderBookTablesService.loadingController.setLoading(true);

    this.chartService.resubscribeLoadData();
    this.orderBookTablesService.resubscribeLoadData();
    this.tradesTableService.resubscribeLoadData();
  }

  #setLocation(pair: string) {
    const url = this.router.createUrlTree([pair]).toString();

    // Don't navigate with refresh, just replace url
    this.location.go(url);
  }

  #getRowCurrency(row: Row) {
    const pairCell = row.cells[0];

    const { base, quote } = convertPairToCurrency(
      pairCell.value as string,
      '/'
    );

    return { base, quote };
  }

  handleRowClick(row: Row) {
    const { base, quote } = this.#getRowCurrency(row);

    if (!base || !quote) return;

    const pair = `${base}_${quote}`;
    const symbol = `${base}${quote}`;

    // Prevent double click
    if (symbol !== this.#globalSymbol) {
      // First set currecy (global symbol)
      this.globalService.setCurrency({ base, quote });
      // Then update order book and trades tables data based on new symbol
      this.#updateWidgetsData();
      // And change url
      this.#setLocation(pair);
    }
  }

  handlePageDataInit(rows: Row[]) {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        first()
      )
      .subscribe(() => {
        const symbols = this.#createFilteredPageSymbols(rows);

        this.#subscribeToStream(symbols);
      });
  }

  handlePageChange(rows: Row[]) {
    this.#nextPageRows$.next(rows);
  }

  #onPageChangeDebounced() {
    this.#nextPageRows$
      .pipe(debounceTime(this.#debounceTime))
      .subscribe((pageRows) => {
        const symbols = this.#createFilteredPageSymbols(pageRows);

        this.#unsubscribeFromCurrentStream();
        this.#subscribeToStream(symbols);
      });
  }

  #subscribeToStream(symbols: string[]) {
    this.tickerService.multipleSubscriber.subscribeToStream({ symbols });
  }

  #unsubscribeFromCurrentStream() {
    this.tickerService.multipleSubscriber.unsubscribeFromCurrentStream();
  }

  #onDataUpdate() {
    this.#data$.subscribe((data) => {
      this.data = data;
    });
  }

  #onRestLoading() {
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
  }

  #onRestAndDataComplete() {
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

  ngOnInit(): void {
    this.#onDataUpdate();
    this.#onRestLoading();
    this.#onPageChangeDebounced();
    this.#onRestAndDataComplete();
  }

  ngOnDestroy(): void {
    this.#nextPageRows$.complete();
  }
}
