import { CandleInterval } from '../features/candles/types/candle-interval';

export const APP_SITE_NAME = 'Binance Exchange Info';
export const APP_DEFAULT_BASE_CURRENCY = 'ETH';
export const APP_DEFAULT_QUOTE_CURRENCY = 'BTC';

export const WIDGET_CHART_DEFAULT_CANDLEINTERVAL: CandleInterval = '1m';
export const WIDGET_TRADES_DEFAULT_LIMIT = 20;
export const WIDGET_DEPTH_DEFAULT_LIMIT = 20;

export const API_HTTP_VERSION = 3;
export const API_HTTP_BASEURL = `https://data.binance.com/api/v${API_HTTP_VERSION}`;
export const API_HTTP_TIMEOUT = 30000;
export const API_WEBSOCKET_BASEURL = 'wss://stream.binance.com:9443/ws';
export const API_START_DELAY = 0; // mainly for debug reasons

export const WEBSOCKET_ENABLED_AT_START = false;
export const WEBSOCKET_START_DELAY = 0; // mainly for debug reasons
export const WEBSOCKET_UNSUBSCRIBE_BASE_ID = 1000;
export const WEBSOCKET_SUBSCRIPTION_DELAY = 1500;

export const MISC_TOFIXED_DIGITS = 2;
