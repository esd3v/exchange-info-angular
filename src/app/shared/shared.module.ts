import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { HeaderModule } from './components/header/header.module';
import { WindowModule } from './components/window/window.module';
import { FormatPricePipe } from './pipes/format-price.pipe';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';
import { SkeletonDirective } from './directives/skeleton.directive';

@NgModule({
  declarations: [
    FormatPricePipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
  imports: [HeaderModule, WindowModule, WebsocketSwitchModule, MatSelectModule],
  exports: [
    HeaderModule,
    WindowModule,
    MatSelectModule,
    WebsocketSwitchModule,
    FormatPricePipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
})
export class SharedModule {}
