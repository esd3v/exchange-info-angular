import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerGroupComponent } from './ticker-group.component';
import { TickerPairModule } from '../ticker-pair/ticker-pair.module';
import { TickerLastPriceModule } from '../ticker-last-price/ticker-last-price.module';
import { TickerChangeModule } from '../ticker-change/ticker-change.module';
import { TickerChangePercentModule } from '../ticker-change-percent/ticker-change-percent.module';
import { TickerLastQuantityModule } from '../ticker-last-quantity/ticker-last-quantity.module';
import { TickerTradesModule } from '../ticker-trades/ticker-trades.module';

@NgModule({
  declarations: [TickerGroupComponent],
  imports: [
    CommonModule,
    TickerPairModule,
    TickerLastPriceModule,
    TickerChangeModule,
    TickerChangePercentModule,
    TickerLastQuantityModule,
    TickerTradesModule,
  ],
  exports: [TickerGroupComponent],
})
export class TickerGroupModule {}
