import { TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Row } from 'src/app/shared/types/row';
import { AppState } from 'src/app/store';
import { WebsocketModule } from 'src/app/websocket/websocket.module';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { PairColumn } from '../types/pair-column';
import { PairsService } from './pairs.service';

describe('PairsService', () => {
  let service: PairsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({}), WebsocketModule.forRoot({ url: '' })],
      providers: [Store<AppState>, GlobalFacade],
    });

    service = TestBed.inject(PairsService);
  });

  it('should create array of symbols from rows', () => {
    const columns: PairColumn[] = [
      { id: 'pair', numeric: false, label: 'Pair' },
      { id: 'lastPrice', numeric: true, label: 'Price' },
      { id: 'priceChangePercent', numeric: true, label: '24h Change' },
    ];

    const rows: Row[] = [
      [{ value: 'BTC/USDT' }, { value: 1 }],
      [{ value: 'ETH/BTC' }, { value: 2 }],
    ];

    const symbols = service.createSymbolsFromRows(columns, rows);

    expect(symbols).toEqual(['BTCUSDT', 'ETHBTC']);
  });
});
