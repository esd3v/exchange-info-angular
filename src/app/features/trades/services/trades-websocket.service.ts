import { Injectable } from '@angular/core';
import { WebsocketTradesStreamParams } from '../types/websocket-trades-stream-params';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';

@Injectable({
  providedIn: 'root',
})
export class TradesWebsocketService {
  public constructor(
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  private createParams = ({ symbol }: WebsocketTradesStreamParams) => [
    `${symbol.toLowerCase()}@trade`,
  ];

  public subscriber = new WebsocketSubscriber(
    3,
    this.createParams,
    this.websocketSubscribeService
  );
}
