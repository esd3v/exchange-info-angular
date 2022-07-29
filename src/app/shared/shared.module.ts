import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderModule } from './components/header/header.module';
import { SkeletonModule } from './components/skeleton/skeleton.module';
import { WindowModule } from './components/window/window.module';
import { FormatLastPricePipe } from './pipes/format-last-price.pipe';
import { FormatPriceChangePercentPipe } from './pipes/format-price-change-percent.pipe';

@NgModule({
  declarations: [FormatLastPricePipe, FormatPriceChangePercentPipe],
  imports: [HeaderModule, SkeletonModule, WindowModule],
  exports: [
    HeaderModule,
    SkeletonModule,
    WindowModule,
    FormatLastPricePipe,
    FormatPriceChangePercentPipe,
  ],
})
export class SharedModule {}
