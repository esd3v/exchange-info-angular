import { Injectable } from '@angular/core';
import { WEBSOCKET_UNSUBSCRIBE_BASE_ID } from 'src/app/shared/config';
import { WebsocketMessageIncoming } from '../types/websocket-message-incoming';
import { WebsocketMessageStreamParams } from '../types/websocket-message-stream-params';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketSubscribeService {
  private subscriptions: Record<string, number> = {};

  public constructor(private websocketService: WebsocketService) {}

  private createSubscription = (
    params: string[],
    method: WebsocketMessageStreamParams['method'],
    id: number
  ): string => {
    return JSON.stringify({
      method,
      params,
      id,
    });
  };

  public subscribe(params: string[], id: number) {
    const stringifiedParams = JSON.stringify(params);
    const subscription = this.createSubscription(params, 'SUBSCRIBE', id);

    this.websocketService.send(subscription);
    this.subscriptions[stringifiedParams] = id;
  }

  public unsubscribe(params: string[], id: number) {
    const stringifiedParams = JSON.stringify(params);
    const subscription = this.createSubscription(params, 'UNSUBSCRIBE', id);

    this.websocketService.send(subscription);
    delete this.subscriptions[stringifiedParams];
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
