import { filter, first } from 'rxjs';
import { WebsocketSubscribeService } from './services/websocket-subscribe.service';

export class WebsocketSubscriber<T> {
  subscribeStatus$ = this.websocketSubscribeService.subscribeStatus$(this.id);

  unsubscribeStatus$ = this.websocketSubscribeService.unsubscribeStatus$(
    this.id
  );

  subscribed$ = this.subscribeStatus$.pipe(
    filter((status) => status === 'done'),
    first()
  );

  unsubscribed$ = this.unsubscribeStatus$.pipe(
    filter((status) => status === 'done'),
    first()
  );

  constructor(
    private id: number,
    private createParams: (params: T) => string[],
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  subscribe(params: T) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.id
    );
  }

  unsubscribe(params: T) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.id
    );
  }

  unsubscribeCurrent() {
    this.websocketSubscribeService.unsubscribeCurrent(this.id);
  }
}
