import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { HeaderModule } from './components/header/header.module';
import { WindowModule } from './components/window/window.module';
import { FormatDecimalPipe } from './pipes/format-decimal.pipe';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';
import { SkeletonDirective } from './directives/skeleton.directive';

@NgModule({
  declarations: [
    FormatDecimalPipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
  imports: [HeaderModule, WindowModule, WebsocketSwitchModule, MatSelectModule],
  exports: [
    HeaderModule,
    WindowModule,
    MatSelectModule,
    WebsocketSwitchModule,
    FormatDecimalPipe,
    FormatPriceChangePercentPipe,
    SkeletonDirective,
  ],
})
export class SharedModule {}
