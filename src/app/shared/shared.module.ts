import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from './components/header/header.module';
import { SkeletonModule } from './components/skeleton/skeleton.module';
import { WindowModule } from './components/window/window.module';
import { FormatLastPricePipe } from './pipes/format-last-price.pipe';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';
import { WebsocketSwitchModule } from './components/websocket-switch/websocket-switch.module';

@NgModule({
  declarations: [FormatLastPricePipe, FormatPriceChangePercentPipe],
  imports: [HeaderModule, SkeletonModule, WindowModule, WebsocketSwitchModule],
  exports: [
    HeaderModule,
    SkeletonModule,
    WindowModule,
    WebsocketSwitchModule,
    FormatLastPricePipe,
    FormatPriceChangePercentPipe,
  ],
})
export class SharedModule {}
