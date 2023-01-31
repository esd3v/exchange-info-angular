import { InjectionToken } from '@angular/core';

export const TOKEN_WEBSOCKET_CONFIG: InjectionToken<string> =
  new InjectionToken('TOKEN_WEBSOCKET_CONFIG');

export interface WebsocketConfig {
  url: string;
  reconnect?: number;
  keepAlive?: {
    msec: number;
    message: string;
  };
}
