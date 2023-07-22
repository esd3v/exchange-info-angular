export interface WebsocketConfig {
  url: string;
  reconnect?: number;
  keepAlive?: {
    msec: number;
    message: string;
  };
}
