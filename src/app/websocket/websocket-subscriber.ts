import { filter, first } from 'rxjs';
import { WebsocketSubscribeService } from './services/websocket-subscribe.service';

export class WebsocketSubscriber<T> {
  subscribeStatus$ = this.websocketSubscribeService.subscribeStatus$(this.id);

  unsubscribeStatus$ = this.websocketSubscribeService.unsubscribeStatus$(
    this.id,
  );

  subscribed$ = this.subscribeStatus$.pipe(
    filter((status) => status === 'done'),
    first(),
  );

  unsubscribed$ = this.unsubscribeStatus$.pipe(
    filter((status) => status === 'done'),
    first(),
  );

  constructor(
    private id: number,
    private createStreamParams: (params: T) => string[],
    private websocketSubscribeService: WebsocketSubscribeService,
  ) {}

  subscribeToStream(params: T) {
    this.websocketSubscribeService.subscribe(
      this.createStreamParams(params),
      this.id,
    );
  }

  unsubscribeFromStream(params: T) {
    this.websocketSubscribeService.unsubscribe(
      this.createStreamParams(params),
      this.id,
    );
  }

  unsubscribeFromCurrentStream() {
    this.websocketSubscribeService.unsubscribeCurrent(this.id);
  }
}
