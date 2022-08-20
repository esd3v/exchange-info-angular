import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerCardModule } from '../ticker-card/ticker-card.module';
import { TickerTradesComponent } from './ticker-trades.component';

@NgModule({
  declarations: [TickerTradesComponent],
  imports: [CommonModule, TickerCardModule],
  exports: [TickerTradesComponent],
})
export class TickerTradesModule {}
