import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { WebsocketCandlesStreamParams } from '../../candles/types/websocket-candles-stream-params';
import { CandlesWebsocketService } from './candles-websocket.service';

describe('CandlesWebsocketService', () => {
  const params: WebsocketCandlesStreamParams = {
    interval: '1d',
    symbol: 'BTCUSDT',
  };

  const expected = ['btcusdt@kline_1d'];

  let service: CandlesWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [CandlesWebsocketService],
    });

    service = TestBed.inject(CandlesWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create params', () => {
    const result = service.createParams(params);

    expect(result).toEqual(expected);
  });
});
