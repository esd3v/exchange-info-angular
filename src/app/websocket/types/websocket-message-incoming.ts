import { WebsocketMessageStreamResponse } from './websocket-message-stream-response';
import { WebsocketCandle } from 'src/app/features/candles/types/websocket-candle';
import { WebsocketOrderBook } from 'src/app/features/order-book/types/websocket-order-book';
import { WebsocketTrades } from 'src/app/features/trades/types/websocket-trades';
import { WebsocketTicker } from 'src/app/features/tickers/types/websocket-ticker';

export type WebsocketMessageIncoming =
  | WebsocketTicker
  | WebsocketOrderBook
  | WebsocketCandle
  | WebsocketTrades
  | WebsocketMessageStreamResponse;
