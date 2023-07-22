import { ModuleWithProviders, NgModule } from '@angular/core';
import { TOKEN_WEBSOCKET_CONFIG } from './injection-tokens';
import { WebsocketConfig } from './types/websocket-config';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';

@NgModule({
  imports: [WebsocketSwitchModule],
})
export class WebsocketModule {
  public static forRoot(
    config?: WebsocketConfig
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
