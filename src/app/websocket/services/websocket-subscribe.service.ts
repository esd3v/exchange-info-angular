import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WebsocketMessageIncoming } from '../types/websocket-message-incoming';
import { WebsocketMessageStreamParams } from '../types/websocket-message-stream-params';
import { WebsocketService } from './websocket.service';

type Params = Record<string, any>;

export type WebsocketSubscription = {
  readonly subscribe: string;
  readonly unsubscribe: string;
};

@Injectable({
  providedIn: 'root',
})
export class WebsocketSubscribeService {
  public constructor(private websocketService: WebsocketService) {}

  public createSubscription<T extends Params>(fn: (params: T) => string[]) {
    return (params: T, id: number): WebsocketSubscription => {
      const createRequest = (
        method: WebsocketMessageStreamParams['method']
      ): string =>
        JSON.stringify({
          method,
          params: fn(params),
          id,
        });

      return {
        get subscribe() {
          return createRequest('SUBSCRIBE');
        },
        get unsubscribe() {
          return createRequest('UNSUBSCRIBE');
        },
      };
    };
  }

  public subscribe(subscription: WebsocketSubscription) {
    this.websocketService.send(subscription.subscribe);
  }

  public unsubscribe(subscription: WebsocketSubscription) {
    this.websocketService.send(subscription.unsubscribe);
  }

  public handleWebsocketMessage(message: string) {
    return ({
      onSubscribe,
      onUnsubscribe,
      onData,
    }: {
      onSubscribe?: (id: number) => void;
      onUnsubscribe?: (id: number) => void;
      onData: (data: WebsocketMessageIncoming) => void;
    }) => {
      const parsed: WebsocketMessageIncoming = JSON.parse(message);

      onData(parsed);

      if (onSubscribe || onUnsubscribe) {
        if ('result' in parsed) {
          const id = parsed.id;
          const subscribed = WEBSOCKET_UNSUBSCRIBE_BASE_ID - id > 0;

          if (onSubscribe && subscribed) {
            onSubscribe(id);
          } else if (onUnsubscribe) {
            onUnsubscribe(id);
          }
        }
      }
    };
  }
}
