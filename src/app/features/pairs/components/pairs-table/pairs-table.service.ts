import { Injectable } from '@angular/core';
import { Dictionary } from '@ngrx/entity';
import { combineLatest, filter, map } from 'rxjs';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';
import { ExchangeSymbolEntity } from 'src/app/features/exchange-info/store/exchange-info.state';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerRestService } from 'src/app/features/ticker/services/ticker-rest.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { formatPrice } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { Row } from 'src/app/shared/table/types/row';
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
    private pairsTableStyleService: PairsTableStyleService
  ) {}

  #globalPair$ = this.globalService.pair$;

  data$ = combineLatest([
    this.exchangeInfoService.tradingSymbols$,
    this.tickerService.tickers$,
    this.#globalPair$,
  ]).pipe(
    map(([tradingSymbols, tickers, globalPair]) =>
      this.#createRows(tradingSymbols, tickers, globalPair.symbol)
    )
  );

  loadingController = new LoadingController(true);

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
