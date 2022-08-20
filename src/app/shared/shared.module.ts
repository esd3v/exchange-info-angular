import { NgModule } from '@angular/core';
import { HeaderModule } from './components/header/header.module';
import { WindowModule } from './components/window/window.module';
import { FormatLastPricePipe } from './pipes/format-last-price.pipe';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';
import { SkeletonDirective } from './directives/skeleton.directive';

@NgModule({
  declarations: [
    FormatLastPricePipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
  imports: [HeaderModule, WindowModule, WebsocketSwitchModule],
  exports: [
    HeaderModule,
    WindowModule,
    WebsocketSwitchModule,
    FormatLastPricePipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
})
export class SharedModule {}
