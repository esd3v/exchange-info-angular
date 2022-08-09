import { NgModule } from '@angular/core';
import { TickerCardModule } from '../ticker-card/ticker.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { TickerLastPriceComponent } from './ticker-last-price.component';

@NgModule({
  declarations: [TickerLastPriceComponent],
  imports: [CommonModule, TickerCardModule, SharedModule],
  exports: [TickerLastPriceComponent],
})
export class TickerLastPriceModule {}
