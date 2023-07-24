import { CandleInterval } from '../features/candles/types/candle-interval';

export const APP_SITE_NAME = 'Binance Exchange Info Demo';
export const APP_DEFAULT_BASE_CURRENCY = 'BTC';
export const APP_DEFAULT_QUOTE_CURRENCY = 'USDT';

export const WIDGET_CHART_DEFAULT_CANDLEINTERVAL: CandleInterval = '1s';
export const WIDGET_TRADES_DEFAULT_LIMIT = 20;
export const WIDGET_DEPTH_DEFAULT_LIMIT = 20;

export const API_HTTP_VERSION = 3;
export const API_HTTP_BASEURL = `https://data.binance.com/api/v${API_HTTP_VERSION}`;
export const API_HTTP_TIMEOUT = 30000;
export const API_WEBSOCKET_BASEURL = 'wss://stream.binance.com:9443/ws';
// export const API_START_DELAY = 0;

export const WEBSOCKET_ENABLED_AT_START = true;
// export const WEBSOCKET_START_DELAY = 0;
export const WEBSOCKET_UNSUBSCRIBE_BASE_ID = 1000;
export const WEBSOCKET_MESSAGES_PER_SECOND_LIMIT = 5;

// 250
export const WEBSOCKET_MESSAGES_QUEUE_DELAY =
  1000 / WEBSOCKET_MESSAGES_PER_SECOND_LIMIT + 50;

export const MISC_TOFIXED_DIGITS = 2;
export const MISC_SNACKBAR_DURATION = 7 * 1000;
