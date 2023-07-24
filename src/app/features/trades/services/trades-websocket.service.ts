import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketTradesStreamParams } from '../types/websocket-trades-stream-params';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService {
  constructor(private websocketSubscribeService: WebsocketSubscribeService) {}

  createParams = ({ symbol }: WebsocketTradesStreamParams) => [
    `${symbol.toLowerCase()}@trade`,
  ];

  subscriber = new WebsocketSubscriber(
    3,
    this.createParams,
    this.websocketSubscribeService
  );
}
