import { Injectable } from '@angular/core';
import { WebsocketMessageStreamParams } from '../models/websocket-message-stream-params.model';

@Injectable({
  providedIn: 'root',
})
export class WebsocketMessagesService {
  public constructor() {}

  public createStreamMessage<T extends Record<string, any>>(
    fn: (params: T) => string[],
    id: number
  ) {
    return (params: T) => {
      const createRequest = (
        method: WebsocketMessageStreamParams['method']
      ): WebsocketMessageStreamParams => ({
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
}
