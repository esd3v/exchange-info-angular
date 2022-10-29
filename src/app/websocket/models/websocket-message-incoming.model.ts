import { MergeExclusive } from 'type-fest';
import { WebsocketTicker } from 'src/app/features/tickers/models/websocket-ticker.model';
import { WebsocketMessageStreamResponse } from './websocket-message-stream-response.model';
import { WebsocketOrderBook } from 'src/app/features/order-book/models/websocket-order-book.model';
import { WebsocketCandle } from 'src/app/features/candles/models/websocket-candle.model';
import { WebsocketTrades } from 'src/app/features/trades/models/websocket-trades.model';

export type WebsocketMessageIncoming = Required<
  MergeExclusive<
    MergeExclusive<
      MergeExclusive<WebsocketTicker, WebsocketMessageStreamResponse>,
      MergeExclusive<WebsocketOrderBook, WebsocketCandle>
    >,
    WebsocketTrades
  >
>;
