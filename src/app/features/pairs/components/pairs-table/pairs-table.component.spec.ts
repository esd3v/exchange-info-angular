import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Dictionary } from '@ngrx/entity';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { Row } from 'src/app/shared/types/row';
import { AppStoreModule } from 'src/app/store/store.module';
import { WebsocketModule } from 'src/app/websocket/websocket.module';
import { PairsTableComponent } from './pairs-table.component';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';

describe('PairsComponent', () => {
  let component: PairsTableComponent;
  let tableStyleService: TableStyleService;
  let fixture: ComponentFixture<PairsTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        AppStoreModule,
        WebsocketModule.forRoot({ url: '' }),
        RouterTestingModule,
        TableModule,
      ],
      declarations: [PairsTableComponent],
    });

    fixture = TestBed.createComponent(PairsTableComponent);
    tableStyleService = TestBed.inject(TableStyleService);
    component = fixture.componentInstance;
  });

  it('should create array of symbols from rows', () => {
    const rows: Row[] = [
      { cells: [{ value: 'BTC/USDT' }, { value: 1 }] },
      { cells: [{ value: 'ETH/BTC' }, { value: 2 }] },
    ];

    const symbols = component.createSymbolsFromRows(rows);

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
            classNames: tableStyleService.cellNegativeClass,
          },
          {
            value: '-50%',
            classNames: tableStyleService.cellNegativeClass,
          },
        ],
        classNames: '',
      },
      {
        cells: [
          { value: 'ETH/BTC' },
          {
            value: '3000.000000',
            classNames: tableStyleService.cellPositiveClass,
          },
          {
            value: '+50%',
            classNames: tableStyleService.cellPositiveClass,
          },
        ],
        classNames: tableStyleService.rowHighlightClass,
      },
    ];

    const rows = component.createRows(symbols, tickers, globalSymbol);

    expect(rows).toEqual(expectedRows);
  });
});
