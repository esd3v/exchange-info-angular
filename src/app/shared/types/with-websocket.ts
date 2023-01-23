import { WebsocketSubscription } from 'src/app/websocket/services/websocket-subscribe.service';

export interface WithWebsocket<T, U> {
  websocketSubscriptionId: {
    subscribe: number | Record<string, number>;
    unsubscribe: number | Record<string, number>;
  };

  websocketSubscription(params: T, id: number): WebsocketSubscription;
  subscribeToWebsocket(params: T, id: number): void;
  unsubscribeFromWebsocket?(params: T, id: number): void;
  onWebsocketOpen(params: any): void;
  handleWebsocketData?(params: U): void;
}
