import { WebsocketSubscribeService } from './services/websocket-subscribe.service';

export class WebsocketSubscriber<T> {
  public subscribeStatus$ = this.websocketSubscribeService.subscribeStatus$(
    this.id
  );

  public unsubscribeStatus$ = this.websocketSubscribeService.unsubscribeStatus$(
    this.id
  );

  public resubscribed$ = this.websocketSubscribeService.resubscribed$(this.id);

  public constructor(
    private id: number,
    private createParams: (params: T) => string[],
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  public subscribe(params: T) {
    this.websocketSubscribeService.subscribe(
      this.createParams(params),
      this.id
    );
  }

  public unsubscribe(params: T) {
    this.websocketSubscribeService.unsubscribe(
      this.createParams(params),
      this.id
    );
  }

  public unsubscribeCurrent() {
    this.websocketSubscribeService.unsubscribeCurrent(this.id);
  }
}
