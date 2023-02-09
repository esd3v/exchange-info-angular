import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerPairComponent } from './ticker-pair.component';
import { TickerCardModule } from '../ticker-card/ticker-card.module';

@NgModule({
  declarations: [TickerPairComponent],
  imports: [CommonModule, TickerCardModule],
  exports: [TickerPairComponent],
})
export class TickerPairModule {}
