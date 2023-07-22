import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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
import { CandlesFacade } from 'src/app/features/candles/services/candles-facade.service';
import { ExchangeInfoFacade } from 'src/app/features/exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { HomeWebsocketService } from 'src/app/features/home/services/home-websocket.service';
import { OrderBookFacade } from 'src/app/features/order-book/services/order-book-facade.service';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { TickerWebsocketService } from 'src/app/features/ticker/services/ticker-websocket.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TradesFacade } from 'src/app/features/trades/services/trades-facade.service';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairColumn } from '../../types/pair-column';
import { CandlesWebsocketService } from 'src/app/features/candles/services/candles-websocket.service';
import { OrderBookTableContainerService } from 'src/app/features/order-book/components/order-book-table-container/order-book-table-container.service';
import { TradesTableService } from 'src/app/features/trades/components/trades-table/trades-table.service';
import { ChartService } from 'src/app/features/candles/components/chart/chart.service';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';

@Component({
  selector: 'app-pairs-table',
  templateUrl: './pairs-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent implements OnDestroy, OnInit {
  private debounceTime = 1000;
  private pageClicks$ = new Subject<void>();
  private prevPageRows$ = new BehaviorSubject<Row[]>([]);
  private pageRows$ = new BehaviorSubject<Row[]>([]);

  private data$ = combineLatest([
    this.exchangeInfoFacade.tradingSymbols$,
    this.tickerFacade.tickers$,
    this.globalFacade.symbol$,
  ]).pipe(
    map(([tradingSymbols, tickers, globalSymbol]) =>
      this.createRows(tradingSymbols, tickers, globalSymbol)
    )
  );

  public data: Row[] = [];
  public pageSizeOptions = [15];

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public loadingController = new LoadingController(true);

  public constructor(
    private router: Router,
    private location: Location,
    private tickerFacade: TickerFacade,
    private tickerRestService: TickerRestService,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private websocketService: WebsocketService,
    private tableStyleService: TableStyleService,
    private tickerWebsocketService: TickerWebsocketService,
    private globalFacade: GlobalFacade,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private orderBookFacade: OrderBookFacade,
    private homeWebsocketService: HomeWebsocketService,
    private tradesTableService: TradesTableService,
    private chartService: ChartService,
    private orderBookTableContainerService: OrderBookTableContainerService,
    private candlesWebsocketService: CandlesWebsocketService
  ) {}

  // Exclude globalSymbol because we already subscribed to it
  private filterSymbol(symbols: string[], symbol: string) {
    return symbols.filter((item) => item !== symbol);
  }

  public createSymbolsFromRows(rows: Row[]) {
    return rows.map((row) => {
      const pairCell = row.cells[0];

      const { base, quote } = convertPairToCurrency(
        pairCell.value as string,
        '/'
      );

      return `${base}${quote}`;
    });
  }

  public createRows(
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

  private updateWidgetsData(symbol: string) {
    // Set loading manually because of ws delay
    this.tradesTableService.loadingController.setLoading(true);
    this.chartService.loadingController.setLoading(true);
    this.orderBookTableContainerService.loadingController.setLoading(true);

    this.homeWebsocketService.widgetsUpdateSubscriber.unsubscribeCurrent();
    this.candlesWebsocketService.subscriber.unsubscribeCurrent();

    this.homeWebsocketService.widgetsUpdateSubscriber.subscribe({
      orderBookParams: {
        symbol,
        limit: WIDGET_DEPTH_DEFAULT_LIMIT,
      },
      tradesParams: {
        symbol,
      },
    });

    this.candlesFacade.interval$.pipe(first()).subscribe((interval) => {
      this.candlesWebsocketService.subscriber.subscribe({ interval, symbol });
    });

    this.homeWebsocketService.widgetsUpdateSubscriber.resubscribed$
      .pipe(first())
      .subscribe(() => {
        this.orderBookFacade.loadData({ symbol });
        this.tradesFacade.loadData({ symbol });
      });

    this.candlesWebsocketService.subscriber.resubscribed$
      .pipe(
        first(),
        switchMap(() => this.candlesFacade.interval$.pipe(first()))
      )
      .subscribe((interval) => {
        this.candlesFacade.loadData({ symbol, interval });
      });
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

        this.updateWidgetsData(symbol);
        this.globalFacade.setCurrency({ base, quote });

        // Don't navigate with refresh, just replace url
        this.location.go(url);
      });
  }

  private getRowCurrency(row: Row) {
    const pairCell = row.cells[0];

    const { base, quote } = convertPairToCurrency(
      pairCell.value as string,
      '/'
    );

    return { base, quote };
  }

  public subscribeToPageSymbols(symbols: string[]) {
    this.tickerWebsocketService.multipleSubscriber.subscribe({ symbols });
  }

  public unsubscribeFromPageSymbols(symbols: string[]) {
    this.tickerWebsocketService.multipleSubscriber.unsubscribe({ symbols });
  }

  public handleRowClick(row: Row) {
    const currency = this.getRowCurrency(row);

    this.changePair(currency);
  }

  public handlePageDataInit(rows: Row[]) {
    this.pageRows$.next(rows);
    this.prevPageRows$.next(rows);
  }

  public handlePageChange(rows: Row[]) {
    this.pageRows$.next(rows);
    this.pageClicks$.next();
  }

  public ngOnInit(): void {
    // Update data
    this.data$.subscribe((data) => {
      this.data = data;
    });

    // On websocket start
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() =>
          combineLatest([
            this.globalFacade.symbol$.pipe(first()),
            this.pageRows$.pipe(
              filter((rows) => Boolean(rows.length)),
              first()
            ),
          ])
        )
      )
      .subscribe(([globalSymbol, pageRows]) => {
        const symbols = this.filterSymbol(
          this.createSymbolsFromRows(pageRows),
          globalSymbol
        );

        this.subscribeToPageSymbols(symbols);
      });

    // On page change debounced
    this.pageClicks$
      .pipe(
        debounceTime(this.debounceTime),
        switchMap(() =>
          combineLatest([
            this.globalFacade.symbol$.pipe(first()),
            this.pageRows$.pipe(first()),
            this.prevPageRows$.pipe(first()),
          ])
        )
      )
      .subscribe(([globalSymbol, pageRows, prevPageRows]) => {
        const prevSymbols = this.filterSymbol(
          this.createSymbolsFromRows(prevPageRows),
          globalSymbol
        );

        const symbols = this.filterSymbol(
          this.createSymbolsFromRows(pageRows),
          globalSymbol
        );

        this.unsubscribeFromPageSymbols(prevSymbols);
        this.subscribeToPageSymbols(symbols);

        this.prevPageRows$.next(pageRows);
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
      this.data$.pipe(filter((data) => Boolean(data.length))),
    ]).subscribe(() => {
      this.loadingController.setLoading(false);
    });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
