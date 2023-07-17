import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { Dictionary } from '@ngrx/entity';
import { StoreModule } from '@ngrx/store';
import { ExchangeSymbolEntity } from 'src/app/features/symbols/store/symbols.state';
import { TickerEntity } from 'src/app/features/ticker/store/ticker.state';
import { Row } from 'src/app/shared/types/row';
import { WebsocketModule } from 'src/app/websocket/websocket.module';
import { PairsTableStyleService } from '../../services/pairs-table-style.service';
import { PairsTableContainerComponent } from './pairs-table-container.component';

describe('PairsComponent', () => {
  let component: PairsTableContainerComponent;
  let pairsTableStyleService: PairsTableStyleService;
  let fixture: ComponentFixture<PairsTableContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        WebsocketModule.forRoot({ url: '' }),
        RouterTestingModule,
        MatPaginatorModule,
      ],
      declarations: [PairsTableContainerComponent],
    });

    fixture = TestBed.createComponent(PairsTableContainerComponent);
    pairsTableStyleService = TestBed.inject(PairsTableStyleService);
    component = fixture.componentInstance;
  });

  it('should create array of symbols from rows', () => {
    const rows: Row[] = [
      [{ value: 'BTC/USDT' }, { value: 1 }],
      [{ value: 'ETH/BTC' }, { value: 2 }],
    ];

    const symbols = component.createSymbolsFromRows(rows);

    expect(symbols).toEqual(['BTCUSDT', 'ETHBTC']);
  });

  it('should create rows from symbols and tickers data', () => {
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
      [
        { value: 'BTC/USDT' },
        {
          value: '2000.000000',
          classNames: pairsTableStyleService.cellNegativeClass,
        },
        {
          value: '-50%',
          classNames: pairsTableStyleService.cellNegativeClass,
        },
      ],
      [
        { value: 'ETH/BTC' },
        {
          value: '3000.000000',
          classNames: pairsTableStyleService.cellPositiveClass,
        },
        {
          value: '+50%',
          classNames: pairsTableStyleService.cellPositiveClass,
        },
      ],
    ];

    const rows = component.createRows(symbols, tickers);

    expect(rows).toEqual(expectedRows);
  });
});
