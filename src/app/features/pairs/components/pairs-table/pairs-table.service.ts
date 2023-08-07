import { Injectable } from '@angular/core';
import { Dictionary } from '@ngrx/entity';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  switchMap,
} from 'rxjs';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';
import { ExchangeSymbolEntity } from 'src/app/features/exchange-info/store/exchange-info.state';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { Row } from 'src/app/shared/table/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { PairsTableStyleService } from './pairs-table-style.service';

@Injectable({ providedIn: 'root' })
export class PairsTableService {
  constructor(
    private tickerService: TickerService,
    private tickerRestService: TickerRestService,
    private exchangeInfoService: ExchangeInfoService,
    private exchangeInfoRestService: ExchangeInfoRestService,
    private tableStyleService: TableStyleService,
    private globalService: GlobalService,
    private websocketService: WebsocketService,
    private pairsTableStyleService: PairsTableStyleService
  ) {}

  #globalPair$ = this.globalService.pair$;

  data$ = combineLatest([
    this.exchangeInfoService.tradingSymbols$,
    this.tickerService.tickers$,
    this.#globalPair$,
  ]).pipe(
    map(([tradingSymbols, tickers, globalPair]) =>
      this.createRows(tradingSymbols, tickers, globalPair.symbol)
    )
  );

  pageRows$ = new BehaviorSubject<Row[]>([]);

  prevPageRows$ = new BehaviorSubject<Row[]>([]);

  loadingController = new LoadingController(true);

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

  createPageSymbols(rows: Row[]) {
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
    const symbols = this.createPageSymbols(rows);

    return symbols.filter((item) => item !== symbol);
  }

  #subscribeToPageStream() {
    combineLatest([
      this.pageRows$.pipe(first()),
      this.#globalPair$.pipe(first()),
    ]).subscribe(([nextPageRows, globalPair]) => {
      const symbols = this.#createFilteredPageSymbols(
        nextPageRows,
        globalPair.symbol
      );

      this.tickerService.multipleSubscriber.subscribeToStream({ symbols });
    });
  }

  resubscribeToNextPageStream() {
    this.websocketService.status$
      .pipe(
        first(),
        filter((status) => status === 'open'),
        switchMap(() =>
          combineLatest([
            this.pageRows$.pipe(first()),
            this.prevPageRows$.pipe(first()),
            this.#globalPair$.pipe(first()),
          ])
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

        this.tickerService.multipleSubscriber.unsubscribeFromStream({
          symbols: prevSymbols,
        });

        this.tickerService.multipleSubscriber.subscribeToStream({
          symbols: nextSymbols,
        });
      });
  }

  onWebsocketOpen() {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() =>
          this.pageRows$.pipe(
            filter((pageRows) => Boolean(pageRows.length)),
            first()
          )
        )
      )
      .subscribe(() => {
        this.#subscribeToPageStream();
      });
  }

  onRestAndDataComplete() {
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
}
