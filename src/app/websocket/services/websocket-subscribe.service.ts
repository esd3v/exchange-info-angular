import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Subject,
  concatMap,
  delay,
  filter,
  map,
  of,
} from 'rxjs';
import {
  WEBSOCKET_MESSAGES_QUEUE_DELAY,
  WEBSOCKET_UNSUBSCRIBE_BASE_ID,
} from 'src/app/shared/config';
import { WebsocketMessageIncoming } from '../types/websocket-message-incoming';
import { WebsocketService } from './websocket.service';
import { WebsocketMessage } from '../types/websocket-message';
import { WebsocketMessageParams } from '../types/websocket-message-stream-params';
import { WebsocketMessageStatus } from '../types/websocket-message-status';

@Injectable({
  providedIn: 'root',
})
export class WebsocketSubscribeService {
  private messages: Map<number, WebsocketMessage> = new Map();
  public messages$ = new BehaviorSubject(this.messages);
  public message$ = new Subject<WebsocketMessage>();
  private queue$ = new BehaviorSubject<WebsocketMessageParams | null>(null);

  public constructor(private websocketService: WebsocketService) {
    // this.message$.subscribe((value) => {
    //   console.log('MESSAGE', value);
    // });

    // this.messages$.subscribe((value) => {
    //   console.log('MESSAGES', value);
    // });

    this.queue$
      .pipe(
        // emit each value with delay
        concatMap((value) =>
          of(value).pipe(delay(WEBSOCKET_MESSAGES_QUEUE_DELAY))
        ),
        filter(Boolean)
      )
      .subscribe((params) => {
        this.processQueueParams(params);
      });
  }

  private createMessage(params: WebsocketMessageParams): WebsocketMessage {
    return {
      params,
      stringified: this.stringifyParams(params),
      status: 'sending',
    };
  }

  private updateStatus(id: number, status: WebsocketMessageStatus) {
    const message = this.messages.get(id);

    if (!message) return;

    this.processMessage({ ...message, status });
  }

  private processQueueParams(params: WebsocketMessageParams) {
    const message = this.createMessage(params);

    this.processMessage(message);
    this.sendMessage(message);
  }

  private processMessage(message: WebsocketMessage) {
    this.messages.set(message.params.id, message);
    this.messages$.next(this.messages);
    this.message$.next(message);
  }

  private sendMessage(message: WebsocketMessage) {
    const strigifiedMessage = this.stringifyParams(message.params);

    this.websocketService.send(strigifiedMessage);
  }

  private stringifyParams = ({
    id,
    method,
    params,
  }: WebsocketMessageParams): string => {
    return JSON.stringify({
      method,
      params,
      id,
    });
  };

  private addToQueue(params: WebsocketMessageParams) {
    this.queue$.next(params);
  }

  public subscribe(params: string[], id: number) {
    this.addToQueue({ id, method: 'SUBSCRIBE', params });
  }

  public unsubscribe(params: string[], id: number) {
    this.addToQueue({
      id: id + WEBSOCKET_UNSUBSCRIBE_BASE_ID,
      method: 'UNSUBSCRIBE',
      params,
    });
  }

  public messageStatusById$(id: number) {
    return this.message$.pipe(
      filter((message) => message?.params.id === id),
      map((subscription) => subscription?.status)
    );
  }

  public subscribeStatusById$(id: number) {
    return this.messageStatusById$(id);
  }

  public unsubscribeStatusById$(id: number) {
    return this.messageStatusById$(id + WEBSOCKET_UNSUBSCRIBE_BASE_ID);
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

      if ('result' in parsed) {
        const id = parsed.id;
        const subscribed = WEBSOCKET_UNSUBSCRIBE_BASE_ID - id > 0;

        if (subscribed) {
          if (onSubscribe) {
            onSubscribe(id);
          }
        } else {
          if (onUnsubscribe) {
            onUnsubscribe(id);
          }
        }

        this.updateStatus(id, 'done');
      }
    };
  }
}
