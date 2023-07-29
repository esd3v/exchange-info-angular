import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
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
import { CandleChartContainerService } from 'src/app/features/candles/components/candle-chart-container/candle-chart-container.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { OrderBookTablesService } from 'src/app/features/order-book/components/order-book-tables/order-book-tables.service';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import { convertPairToCurrency } from 'src/app/shared/helpers';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { Row } from '../../../../shared/table/types/row';
import { PairColumn } from '../../types/pair-column';
import { PairsTableService } from './pairs-table-service';
import { PairsTableStyleService } from './pairs-table-style.service';

@Component({
  selector: 'app-pairs-table',
  styleUrls: ['./pairs-table.component.scss'],
  templateUrl: './pairs-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent implements OnDestroy, OnInit {
  #globalPair$ = this.globalService.pair$;

  #debounceTime = 1000;

  #nextPageRows$ = new Subject<Row[]>();

  #prevPageRows$ = new BehaviorSubject<Row[]>([]);

  data: Row[] = [];

  pageSizeOptions = [15];

  columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  styles = this.pairsTableStyleService;

  loadingController = this.pairsTableService.loadingController;

  constructor(
    private router: Router,
    private location: Location,
    private tickerService: TickerService,
    private tickerRestService: TickerRestService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private websocketService: WebsocketService,
    private globalService: GlobalService,
    private tradesTableService: TradesTableService,
    private candleChartContainerService: CandleChartContainerService,
    private orderBookTablesService: OrderBookTablesService,
    private pairsTableStyleService: PairsTableStyleService,
    private pairsTableService: PairsTableService
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
  #createFilteredPageSymbols(rows: Row[], symbol: string) {
    const symbols = this.#createPageSymbols(rows);

    return symbols.filter((item) => item !== symbol);
  }

  #updateWidgetsData() {
    // Set loading manually because of ws delay
    this.tradesTableService.loadingController.setLoading(true);
    this.candleChartContainerService.loadingController.setLoading(true);
    this.orderBookTablesService.loadingController.setLoading(true);

    this.candleChartContainerService.resubscribeLoadData();
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
    this.#globalPair$.pipe(first()).subscribe((globalPair) => {
      if (symbol !== globalPair.symbol) {
        // First set currecy (global symbol)
        this.globalService.setCurrency({ base, quote });
        // Then update order book and trades tables data based on new symbol
        this.#updateWidgetsData();
        // And change url
        this.#setLocation(pair);
      }
    });
  }

  handlePageDataInit(rows: Row[]) {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() => this.#globalPair$),
        first()
      )
      .subscribe((globalPair) => {
        const symbols = this.#createFilteredPageSymbols(
          rows,
          globalPair.symbol
        );

        this.#subscribeToStream(symbols);
      });

    this.#prevPageRows$.next(rows);
  }

  handlePageChange(rows: Row[]) {
    this.#nextPageRows$.next(rows);
  }

  #onPageChangeDebounced() {
    this.#nextPageRows$
      .pipe(
        debounceTime(this.#debounceTime),
        switchMap((nextPageRows) =>
          combineLatest([
            this.#prevPageRows$.pipe(first()),
            this.#globalPair$.pipe(first()),
          ]).pipe(
            map(
              ([prevPageRows, globalPair]) =>
                [nextPageRows, prevPageRows, globalPair] as const
            )
          )
        )
      )
      .subscribe(([nextPageRows, prevPageRows, globalPair]) => {
        const nextSymbols = this.#createFilteredPageSymbols(
          nextPageRows,
          globalPair.symbol
        );

        const prevSymbols = this.#createFilteredPageSymbols(
          prevPageRows,
          globalPair.symbol
        );

        this.#unsubscribeFromStream(prevSymbols);
        this.#subscribeToStream(nextSymbols);
        this.#prevPageRows$.next(nextPageRows);
      });
  }

  #subscribeToStream(symbols: string[]) {
    this.tickerService.multipleSubscriber.subscribeToStream({ symbols });
  }

  #unsubscribeFromStream(symbols: string[]) {
    this.tickerService.multipleSubscriber.unsubscribeFromStream({ symbols });
  }

  #onDataUpdate() {
    this.pairsTableService.data$.subscribe((data) => {
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

  ngOnInit(): void {
    this.#onDataUpdate();
    this.#onRestLoading();
    this.#onPageChangeDebounced();
  }

  ngOnDestroy(): void {
    this.#nextPageRows$.complete();
  }
}
