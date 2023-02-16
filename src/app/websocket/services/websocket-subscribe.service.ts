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

  public subscribe(params: string[]) {
    const stringifiedParams = JSON.stringify(params);
    const prevSubscribeId = this.subscriptions[stringifiedParams];
    const newSubscribeId = Object.keys(this.subscriptions).length + 1;
    const id = prevSubscribeId || newSubscribeId;
    const subscription = this.createSubscription(params, 'SUBSCRIBE', id);

    this.websocketService.send(subscription);
    this.subscriptions[stringifiedParams] = newSubscribeId;
  }

  public unsubscribe(params: string[]) {
    const stringifiedParams = JSON.stringify(params);
    const prevSubscribeId = this.subscriptions[stringifiedParams];

    const id = prevSubscribeId
      ? prevSubscribeId + WEBSOCKET_UNSUBSCRIBE_BASE_ID
      : -1; // -1 if trying to unsubscrube if previously wasn't subscribed

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
