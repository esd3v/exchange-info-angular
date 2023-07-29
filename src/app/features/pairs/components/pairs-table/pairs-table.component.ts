import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, debounceTime, filter, first } from 'rxjs';
import { CandleChartContainerService } from 'src/app/features/candles/components/candle-chart-container/candle-chart-container.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { OrderBookTablesService } from 'src/app/features/order-book/components/order-book-tables/order-book-tables.service';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import { convertPairToCurrency } from 'src/app/shared/helpers';
import { Row } from '../../../../shared/table/types/row';
import { PairColumn } from '../../types/pair-column';
import { PairsTableStyleService } from './pairs-table-style.service';
import { PairsTableService } from './pairs-table.service';

@Component({
  selector: 'app-pairs-table',
  styleUrls: ['./pairs-table.component.scss'],
  templateUrl: './pairs-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent implements OnDestroy, OnInit {
  #globalPair$ = this.globalService.pair$;

  #debounceTime = 1000;

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
    private tickerRestService: TickerRestService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private globalService: GlobalService,
    private tradesTableService: TradesTableService,
    private candleChartContainerService: CandleChartContainerService,
    private orderBookTablesService: OrderBookTablesService,
    private pairsTableStyleService: PairsTableStyleService,
    private pairsTableService: PairsTableService
  ) {}

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
    this.pairsTableService.pageRows$.next(rows);
  }

  handlePageChange(rows: Row[]) {
    this.pairsTableService.pageRows$.pipe(first()).subscribe((pageRows) => {
      this.pairsTableService.pageRows$.next(rows);
      this.pairsTableService.prevPageRows$.next(pageRows);
    });
  }

  #onPageChangeDebounced() {
    this.pairsTableService.prevPageRows$
      .pipe(filter((prevPageRows) => Boolean(prevPageRows.length)))
      .pipe(debounceTime(this.#debounceTime))
      .subscribe(() => {
        this.pairsTableService.resubscribeToNextPageStream();
      });
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
    this.pairsTableService.pageRows$.complete();
    this.pairsTableService.prevPageRows$.complete();
  }
}
