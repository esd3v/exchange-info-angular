import { WebsocketMessageStatus } from './websocket-message-status';
import { WebsocketMessageParams } from './websocket-message-stream-params';

export type WebsocketMessage = {
  params: WebsocketMessageParams;
  status: WebsocketMessageStatus;
  stringified: string;
};
