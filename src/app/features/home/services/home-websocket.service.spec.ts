import { TestBed } from '@angular/core/testing';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketCandlesStreamParams } from '../../candles/types/websocket-candles-stream-params';
import { WebsocketOrderBookStreamParams } from '../../order-book/types/websocket-order-book-stream-params';
import { WebsocketTradesStreamParams } from '../../trades/types/websocket-trades-stream-params';
import { HomeWebsocketService } from './home-websocket.service';
import { AppModule } from 'src/app/app.module';

describe('HomeWebsocketService', () => {
  const symbol = 'BTCUSDT';

  const params: {
    candlesParams: WebsocketCandlesStreamParams;
    orderBookParams: WebsocketOrderBookStreamParams;
    tradesParams: WebsocketTradesStreamParams;
  } = {
    candlesParams: {
      interval: '1d',
      symbol,
    },
    orderBookParams: {
      symbol,
      limit: WIDGET_DEPTH_DEFAULT_LIMIT,
    },
    tradesParams: {
      symbol,
    },
  };

  const expected = [
    'btcusdt@kline_1d',
    'btcusdt@depth20@1000ms',
    'btcusdt@trade',
  ];

  let service: HomeWebsocketService;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('websocketSubscribeService', [
      'subscribe',
      'unsubscribe',
      'subscribeStatus$',
      'unsubscribeStatus$',
      'resubscribed$',
    ]);

    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [
        HomeWebsocketService,
        {
          provide: WebsocketSubscribeService,
          useValue: spy,
        },
      ],
    });

    service = TestBed.inject(HomeWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create params', () => {
    const result = service.createParams(params);

    expect(result).toEqual(expected);
  });
});
