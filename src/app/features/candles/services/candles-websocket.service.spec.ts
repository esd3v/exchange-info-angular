import { TestBed } from '@angular/core/testing';
import { CandlesWebsocketService } from './candles-websocket.service';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';

describe('CandlesWebsocketService', () => {
  const symbol = 'BTCUSDT';
  const interval = '1h';
  const expected = 'btcusdt@kline_1h';

  let service: CandlesWebsocketService;
  let websocketSubscribeServiceSpy: jasmine.SpyObj<WebsocketSubscribeService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('websocketSubscribeService', [
      'subscribe',
      'unsubscribe',
    ]);

    TestBed.configureTestingModule({
      providers: [
        CandlesWebsocketService,
        {
          provide: WebsocketSubscribeService,
          useValue: spy,
        },
      ],
    });

    service = TestBed.inject(CandlesWebsocketService);

    websocketSubscribeServiceSpy = TestBed.inject(
      WebsocketSubscribeService
    ) as jasmine.SpyObj<WebsocketSubscribeService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should subscribe', () => {
    const params: WebsocketCandlesStreamParams = { symbol, interval };

    service.subscribe(params);

    expect(websocketSubscribeServiceSpy.subscribe).toHaveBeenCalledWith(
      [expected],
      0
    );
  });

  it('should unsubscribe', () => {
    const params: WebsocketCandlesStreamParams = { symbol, interval };

    service.unsubscribe(params);

    expect(websocketSubscribeServiceSpy.unsubscribe).toHaveBeenCalledWith(
      [expected],
      0
    );
  });
});
