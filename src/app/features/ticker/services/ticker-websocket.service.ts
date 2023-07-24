import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TickerWebsocketService {
  constructor(private websocketSubscribeService: WebsocketSubscribeService) {}

  createParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  singleSubscriber = new WebsocketSubscriber(
    2,
    this.createParams,
    this.websocketSubscribeService
  );

  multipleSubscriber = new WebsocketSubscriber(
    5,
    this.createParams,
    this.websocketSubscribeService
  );
}
