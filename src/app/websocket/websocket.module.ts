import { NgModule } from '@angular/core';
import { WebsocketMessagesService } from './services/websocket-messages.service';
import { WebsocketService } from './services/websocket.service';

@NgModule({
  providers: [WebsocketService, WebsocketMessagesService],
})
export class WebsocketModule {}
