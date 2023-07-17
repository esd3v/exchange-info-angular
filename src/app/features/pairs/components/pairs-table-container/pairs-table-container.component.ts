import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { TradesWebsocketService } from 'src/app/features/trades/services/trades-websocket.service';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairsTableStyleService } from '../../services/pairs-table-style.service';

@Component({
  selector: 'app-pairs-table-container',
  templateUrl: './pairs-table-container.component.html',
})
export class PairsTableContainerComponent
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

  public constructor(
    private router: Router,
    private location: Location,
    private tickerFacade: TickerFacade,
    private exchangeInfoFacade: ExchangeInfoFacade,
    private websocketService: WebsocketService,
    private pairsTableStyleService: PairsTableStyleService,
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
      const pairCell = row[0];

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

        rows.push([
          { value: pair },
          {
            value: formattedPrice,
            classNames: prevLastPrice
              ? lastPrice > prevLastPrice
                ? this.pairsTableStyleService.cellPositiveClass
                : lastPrice < prevLastPrice
                ? this.pairsTableStyleService.cellNegativeClass
                : ''
              : '',
          },
          {
            value: priceChangePercentFormatted,
            classNames:
              Number(priceChangePercent) > 0
                ? this.pairsTableStyleService.cellPositiveClass
                : Number(priceChangePercent) < 0
                ? this.pairsTableStyleService.cellNegativeClass
                : '',
          },
        ]);
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
    const pairCell = row[0];

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
