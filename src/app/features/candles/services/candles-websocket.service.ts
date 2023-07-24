import { Injectable } from '@angular/core';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketCandlesStreamParams } from '../types/websocket-candles-stream-params';

@Injectable({
  providedIn: 'root',
})
export class CandlesWebsocketService {
  constructor(private websocketSubscribeService: WebsocketSubscribeService) {}

  createParams = ({ symbol, interval }: WebsocketCandlesStreamParams) => [
    `${symbol.toLowerCase()}@kline_${interval}`,
  ];

  subscriber = new WebsocketSubscriber(
    1,
    this.createParams,
    this.websocketSubscribeService
  );
}
