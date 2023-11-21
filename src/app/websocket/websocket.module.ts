import { ModuleWithProviders, NgModule } from '@angular/core';
import { TOKEN_WEBSOCKET_CONFIG } from './injection-tokens';
import { WebsocketConfig } from './types/websocket-config';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';
import { WebsocketService } from './services/websocket.service';
import { WebsocketSubscribeService } from './services/websocket-subscribe.service';

@NgModule({
  imports: [WebsocketSwitchModule],
  providers: [WebsocketService, WebsocketSubscribeService],
})
export class WebsocketModule {
  static forRoot(
    config?: WebsocketConfig,
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
