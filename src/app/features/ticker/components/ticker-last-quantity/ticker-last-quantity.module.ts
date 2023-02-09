import { NgModule } from '@angular/core';
import { TickerCardModule } from '../ticker-card/ticker-card.module';
import { CommonModule } from '@angular/common';
import { TickerLastQuantityComponent } from './ticker-last-quantity.component';

@NgModule({
  declarations: [TickerLastQuantityComponent],
  imports: [CommonModule, TickerCardModule],
  exports: [TickerLastQuantityComponent],
})
export class TickerLastQuantityModule {}
