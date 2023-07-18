import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Dictionary } from '@ngrx/entity';
import { Subject, combineLatest, debounceTime, filter, first, map } from 'rxjs';
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
import { TradesWebsocketService } from 'src/app/features/trades/services/trades-websocket.service';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairColumn } from '../../types/pair-column';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';

@Component({
  selector: 'app-pairs-table',
  templateUrl: './pairs-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class PairsTableComponent
  extends LoadingController
  implements OnDestroy, OnInit
{
  private debounceTime = 1000;
  private pageClicks$ = new Subject<void>();
  private prevPageRows: Row[] = [];
  private pageRows: Row[] = [];

  private data$ = combineLatest([
    this.exchangeInfoFacade.tradingSymbols$,
    this.tickerFacade.tickers$,
  ]).pipe(
    map(([tradingSymbols, tickers]) => this.createRows(tradingSymbols, tickers))
  );

  public data: Row[] = [];
  public pageSizeOptions = [15];

  public columns: PairColumn[] = [
    { id: 'pair', numeric: false, label: 'Pair' },
    { id: 'lastPrice', numeric: true, label: 'Price' },
    { id: 'priceChangePercent', numeric: true, label: '24h Change' },
  ];

  public constructor(
    private router: Router,
    private location: Location,
    private tickerFacade: TickerFacade,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private websocketService: WebsocketService,
    private tableStyleService: TableStyleService,
    private tickerWebsocketService: TickerWebsocketService,
    private globalFacade: GlobalFacade,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private orderBookWebsocketService: OrderBookWebsocketService,
    private tradesWebsocketService: TradesWebsocketService,
    private orderBookFacade: OrderBookFacade,
    private chartService: ChartService
  ) {
    // Set loading
    super(true);
  }

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
          classNames: '',
        });
      }
    }

    return rows;
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
    this.orderBookFacade.unsubscribeCurrent();
    this.orderBookWebsocketService.subscribe({ symbol });

    this.orderBookWebsocketService.resubscribed$.pipe(first()).subscribe(() => {
      this.orderBookFacade.loadData({ symbol });
    });
  }

  public handleTradesOnRowClick({
    symbol,
  }: Parameters<typeof this.tradesFacade.loadData>[0]) {
    this.tradesFacade.unsubscribeCurrent();
    this.tradesWebsocketService.subscribe({ symbol });

    this.tradesWebsocketService.resubscribed$.pipe(first()).subscribe(() => {
      this.tradesFacade.loadData({ symbol });
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

        // this.pairsService.handleCandlesOnRowClick({ symbol });
        this.handleOrderBookOnRowClick({ symbol });
        this.handleTradesOnRowClick({ symbol });

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
    this.tickerWebsocketService.subscribePairs({ symbols });
  }

  public unsubscribeFromPageSymbols(symbols: string[]) {
    this.tickerWebsocketService.unsubscribePairs({ symbols });
  }

  public handleRowClick(row: Row) {
    const currency = this.getRowCurrency(row);

    this.changePair(currency);
  }

  public handlePageDataInit(rows: Row[]) {
    this.pageRows = rows;
    this.prevPageRows = rows;
  }

  public handlePageChange(rows: Row[]) {
    this.pageRows = rows;
    this.pageClicks$.next();
  }

  public ngOnInit(): void {
    // Update data
    this.data$.subscribe((data) => {
      this.data = data;
    });

    // On websocket start
    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.websocketService.status$.pipe(filter((status) => status === 'open')),
    ]).subscribe(([globalSymbol]) => {
      const symbols = this.filterSymbol(
        this.createSymbolsFromRows(this.pageRows),
        globalSymbol
      );

      this.subscribeToPageSymbols(symbols);
    });

    // On page change debounced
    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.pageClicks$.pipe(debounceTime(this.debounceTime)),
    ]).subscribe(([globalSymbol]) => {
      const prevSymbols = this.filterSymbol(
        this.createSymbolsFromRows(this.prevPageRows),
        globalSymbol
      );

      const symbols = this.filterSymbol(
        this.createSymbolsFromRows(this.pageRows),
        globalSymbol
      );

      this.unsubscribeFromPageSymbols(prevSymbols);
      this.subscribeToPageSymbols(symbols);

      this.prevPageRows = this.pageRows;
    });

    // REST loading
    combineLatest([
      this.tickerFacade.restStatus$.pipe(
        filter((status) => status === 'loading')
      ),
      this.exchangeInfoFacade.restStatus$.pipe(
        filter((status) => status === 'loading')
      ),
    ]).subscribe(() => {
      this.setLoading(true);
    });

    // REST and data complete
    combineLatest([
      this.tradesFacade.restStatus$.pipe(
        filter((status) => status === 'success')
      ),
      this.exchangeInfoFacade.restStatus$.pipe(
        filter((status) => status === 'success')
      ),
      this.data$.pipe(filter((data) => Boolean(data.length))),
    ]).subscribe(() => {
      this.setLoading(false);
    });
  }

  public ngOnDestroy(): void {
    this.pageClicks$.complete();
  }
}
