import { ModuleWithProviders, NgModule } from '@angular/core';
import { WebsocketMessagesService } from './services/websocket-messages.service';
import { WebsocketService } from './services/websocket.service';
import { TOKEN_WEBSOCKET_CONFIG, WebsocketConfig } from './websocket-config';

@NgModule({
  providers: [WebsocketService, WebsocketMessagesService],
})
export class WebsocketModule {
  public static forRoot(
    config: WebsocketConfig
  ): ModuleWithProviders<WebsocketModule> {
    return {
      ngModule: WebsocketModule,
      providers: [
        {
          provide: TOKEN_WEBSOCKET_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
