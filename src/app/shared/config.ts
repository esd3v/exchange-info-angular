export const SITE_NAME = 'Binance Exchange Info';

export const API_HTTP_VERSION = 3;
export const API_HTTP_BASEURL = `https://api.binance.com/api/v${API_HTTP_VERSION}`;
export const API_HTTP_TIMEOUT = 30000;
export const API_WEBSOCKET_BASEURL = 'wss://stream.binance.com:9443/ws';

export const WEBSOCKET_ENABLED_AT_START = true;
export const WEBSOCKET_START_DELAY = 0; // mainly for debug reasons
export const WEBSOCKET_UNSUBSCRIBE_BASE_ID = 1000;
export const WEBSOCKET_SUBSCRIPTION_DELAY = 1500;
export const TOFIXED_DIGITS = 2;
