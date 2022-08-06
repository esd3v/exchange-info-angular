import { MergeExclusive } from 'type-fest';
import { WebsocketTicker } from 'src/app/features/ticker/models/websocket-ticker.model';
import { WebsocketMessageStreamResponse } from './websocket-message-stream-response.model';

export type WebsocketMessageIncoming = MergeExclusive<
  WebsocketTicker,
  WebsocketMessageStreamResponse
>;