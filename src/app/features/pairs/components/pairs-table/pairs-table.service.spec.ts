import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@ngrx/entity';
import { ExchangeSymbolEntity } from 'src/app/features/exchange-info/store/exchange-info.state';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { Row } from 'src/app/shared/table/types/row';
import { AppStoreModule } from 'src/app/store/store.module';
import { WebsocketModule } from 'src/app/websocket/websocket.module';
import { PairsTableStyleService } from './pairs-table-style.service';
import { PairsTableService } from './pairs-table.service';

describe('PairsTableService', () => {
  let service: PairsTableService;
  let tableStyleService: TableStyleService;
  let pairsTableStyleService: PairsTableStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppStoreModule,
        HttpClientTestingModule,
        WebsocketModule.forRoot(),
      ],
      providers: [PairsTableService],
    });

    service = TestBed.inject(PairsTableService);
    tableStyleService = TestBed.inject(TableStyleService);
    pairsTableStyleService = TestBed.inject(PairsTableStyleService);
  });

  it('should create array of symbols from rows', () => {
    const rows: Row[] = [
      { cells: [{ value: 'BTC/USDT' }, { value: 1 }] },
      { cells: [{ value: 'ETH/BTC' }, { value: 2 }] },
    ];

    const symbols = service.createPageSymbols(rows);

    expect(symbols).toEqual(['BTCUSDT', 'ETHBTC']);
  });

  it('should create rows from symbols and tickers data', () => {
    const globalSymbol = 'ETHBTC';

    const symbols: ExchangeSymbolEntity[] = [
      {
        symbol: 'BTCUSDT',
        baseAsset: 'BTC',
        quoteAsset: 'USDT',
        status: 'TRADING',
        PRICE_FILTER: {
          minPrice: '0.00000100',
          maxPrice: '100000.00000000',
          tickSize: '0.00000100',
        },
      },
      {
        symbol: 'ETHBTC',
        baseAsset: 'ETH',
        quoteAsset: 'BTC',
        status: 'TRADING',
        PRICE_FILTER: {
          minPrice: '0.00000100',
          maxPrice: '100000.00000000',
          tickSize: '0.00000100',
        },
      },
    ];

    const tickers: Dictionary<TickerEntity> = {
      BTCUSDT: {
        symbol: 'BTCUSDT',
        lastPrice: '2000',
        priceChangePercent: '-50',
        prevLastPrice: '3000',
        count: 1,
        lastQty: '1',
        priceChange: '1',
      },
      ETHBTC: {
        symbol: 'ETHBTC',
        lastPrice: '3000',
        priceChangePercent: '50',
        prevLastPrice: '2000',
        count: 1,
        lastQty: '1',
        priceChange: '1',
      },
    };

    const expectedRows: Row[] = [
      {
        cells: [
          { value: 'BTC/USDT' },
          {
            value: '2000.000000',
            classNames: [tableStyleService.cellNegativeClass],
          },
          {
            value: '-50%',
            classNames: [tableStyleService.cellNegativeClass],
          },
        ],
        classNames: [pairsTableStyleService.rowClass, ''],
      },
      {
        cells: [
          { value: 'ETH/BTC' },
          {
            value: '3000.000000',
            classNames: [tableStyleService.cellPositiveClass],
          },
          {
            value: '+50%',
            classNames: [tableStyleService.cellPositiveClass],
          },
        ],
        classNames: [
          pairsTableStyleService.rowClass,
          tableStyleService.rowHighlightClass,
        ],
      },
    ];

    const rows = service.createRows(symbols, tickers, globalSymbol);

    expect(rows).toEqual(expectedRows);
  });
});
