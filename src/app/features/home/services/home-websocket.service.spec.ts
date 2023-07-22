import { TestBed } from '@angular/core/testing';
import { AppModule } from 'src/app/app.module';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { WebsocketOrderBookStreamParams } from '../../order-book/types/websocket-order-book-stream-params';
import { WebsocketTradesStreamParams } from '../../trades/types/websocket-trades-stream-params';
import { HomeWebsocketService } from './home-websocket.service';

describe('HomeWebsocketService', () => {
  const symbol = 'BTCUSDT';

  const params: {
    orderBookParams: WebsocketOrderBookStreamParams;
    tradesParams: WebsocketTradesStreamParams;
  } = {
    orderBookParams: {
      symbol,
      limit: WIDGET_DEPTH_DEFAULT_LIMIT,
    },
    tradesParams: {
      symbol,
    },
  };

  const expected = ['btcusdt@depth20@1000ms', 'btcusdt@trade'];

  let service: HomeWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
      providers: [HomeWebsocketService],
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
