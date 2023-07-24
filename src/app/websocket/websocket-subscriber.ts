import { WebsocketSubscribeService } from './services/websocket-subscribe.service';

export class WebsocketSubscriber<T> {
  subscribeStatus$ = this.websocketSubscribeService.subscribeStatus$(this.id);

  unsubscribeStatus$ = this.websocketSubscribeService.unsubscribeStatus$(
    this.id
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
