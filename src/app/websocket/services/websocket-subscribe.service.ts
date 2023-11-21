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
import { WebsocketMessage } from '../types/websocket-message';
import { WebsocketMessageIncoming } from '../types/websocket-message-incoming';
import { WebsocketMessageStatus } from '../types/websocket-message-status';
import { WebsocketMessageParams } from '../types/websocket-message-stream-params';
import { WebsocketService } from './websocket.service';

@Injectable()
export class WebsocketSubscribeService {
  #messages: WebsocketMessage[] = [];

  #messages$ = new Subject<WebsocketMessage[]>();

  #queue$ = new BehaviorSubject<WebsocketMessage | null>(null);

  constructor(private websocketService: WebsocketService) {
    // this.#messages$.subscribe((value) => {
    //   console.log('MESSAGES', value);
    // });

    this.#queue$
      .pipe(
        // emit each message with delay
        concatMap((value) =>
          of(value).pipe(delay(WEBSOCKET_MESSAGES_QUEUE_DELAY)),
        ),
        filter(Boolean),
      )
      .subscribe((message) => {
        this.#sendMessage(message);
      });
  }

  #createMessage(params: WebsocketMessageParams): WebsocketMessage {
    return {
      params,
      stringified: this.#stringifyParams(params),
      status: 'sending',
    };
  }

  #setStatus(id: number, status: WebsocketMessageStatus) {
    const updated = this.#messages.map((item) =>
      item.params.id === id ? { ...item, status } : item,
    );

    this.#messages = updated;
    this.#messages$.next(updated);
  }

  #addMessage(message: WebsocketMessage) {
    const index = this.#messages.findIndex(
      (item) => item.params.id === message.params.id,
    );

    const updated =
      index > -1
        ? this.#messages.map((item) =>
            item.params.id === message.params.id ? message : item,
          )
        : [...this.#messages, message];

    this.#messages = updated;
    this.#messages$.next(updated);
  }

  #sendMessage(message: WebsocketMessage) {
    const strigifiedMessage = this.#stringifyParams(message.params);

    this.websocketService.send(strigifiedMessage);
  }

  #stringifyParams = ({
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

  #addToQueue(params: WebsocketMessageParams) {
    const message = this.#createMessage(params);

    this.#addMessage(message);
    this.#queue$.next(message);
  }

  subscribe(params: string[], id: number) {
    this.#addToQueue({ id, method: 'SUBSCRIBE', params });
  }

  unsubscribe(params: string[], id: number) {
    this.#addToQueue({
      id: id + WEBSOCKET_UNSUBSCRIBE_BASE_ID,
      method: 'UNSUBSCRIBE',
      params,
    });
  }

  unsubscribeCurrent(id: number) {
    const message = this.#messages.find((item) => item.params.id === id);

    if (!message) return;

    this.unsubscribe(message.params.params, id);
  }

  messageStatusById$(id: number) {
    return this.#messages$.pipe(
      map((messages) => messages.find((item) => item.params.id === id)?.status),
    );
  }

  subscribeStatus$(id: number) {
    return this.messageStatusById$(id);
  }

  unsubscribeStatus$(id: number) {
    return this.messageStatusById$(id + WEBSOCKET_UNSUBSCRIBE_BASE_ID);
  }

  handleWebsocketMessage(message: string) {
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

        this.#setStatus(id, 'done');
      }
    };
  }
}
