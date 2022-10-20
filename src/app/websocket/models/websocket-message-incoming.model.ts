import { MergeExclusive } from 'type-fest';
import { WebsocketTicker } from 'src/app/features/tickers/models/websocket-ticker.model';
import { WebsocketMessageStreamResponse } from './websocket-message-stream-response.model';
import { WebsocketOrderBook } from 'src/app/features/order-book/models/websocket-order-book.model';
import { WebsocketCandle } from 'src/app/features/candles/models/websocket-candle.model';

export type WebsocketMessageIncoming = Required<
  MergeExclusive<
    MergeExclusive<WebsocketTicker, WebsocketMessageStreamResponse>,
    MergeExclusive<WebsocketOrderBook, WebsocketCandle>
  >
>;
