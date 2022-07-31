import { WebsocketTicker } from 'src/app/features/ticker/models/websocket-ticker.model';
import { MergeExclusive } from 'type-fest';
import { WebsocketMessageStreamParams } from './websocket-message-stream-params.model';

export type WebsocketMessageIncoming = MergeExclusive<
  WebsocketTicker,
  WebsocketMessageStreamParams
>;
