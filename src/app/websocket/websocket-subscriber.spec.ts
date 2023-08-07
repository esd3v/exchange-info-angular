import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { WebsocketSubscribeService } from './services/websocket-subscribe.service';
import { WebsocketSubscriber } from './websocket-subscriber';
import { WebsocketModule } from './websocket.module';

describe('WebsocketSubscriber', () => {
  let subscriber: WebsocketSubscriber<any>;
  let websocketSubscribeService: WebsocketSubscribeService;
  let websocketSubscribeServiceSpy: jasmine.SpyObj<WebsocketSubscribeService>;

  const id = 0;
  const streamParams: string[] = [];

  beforeEach(() => {
    websocketSubscribeServiceSpy = jasmine.createSpyObj(
      'WebsocketSubscribeService',
      ['subscribe', 'unsubscribe', 'unsubscribeCurrent']
    );

    websocketSubscribeServiceSpy.subscribeStatus$ = (() =>
      of(undefined)) as jasmine.Spy;

    websocketSubscribeServiceSpy.unsubscribeStatus$ = (() =>
      of(undefined)) as jasmine.Spy;

    TestBed.configureTestingModule({
      imports: [WebsocketModule.forRoot()],
      providers: [
        {
          provide: WebsocketSubscribeService,
          useValue: websocketSubscribeServiceSpy,
        },
      ],
    });

    websocketSubscribeService = TestBed.inject(WebsocketSubscribeService);

    subscriber = new WebsocketSubscriber<any>(
      id,
      () => streamParams,
      websocketSubscribeService
    );
  });

  it('should subscribe to stream', () => {
    subscriber.subscribeToStream({});

    expect(websocketSubscribeServiceSpy.subscribe).toHaveBeenCalledWith(
      streamParams,
      id
    );
  });

  it('should unsubscribe from stream', () => {
    subscriber.unsubscribeFromStream({});

    expect(websocketSubscribeServiceSpy.unsubscribe).toHaveBeenCalledWith(
      streamParams,
      id
    );
  });

  it('should unsubscribe from current stream', () => {
    subscriber.unsubscribeFromCurrentStream();

    expect(
      websocketSubscribeServiceSpy.unsubscribeCurrent
    ).toHaveBeenCalledWith(id);
  });
});
