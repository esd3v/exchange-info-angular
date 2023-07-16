import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TickerCardModule } from '../ticker-card/ticker-card.module';
import { TickerGroupComponent } from './ticker-group.component';

@NgModule({
  declarations: [TickerGroupComponent],
  imports: [CommonModule, TickerCardModule],
  exports: [TickerGroupComponent],
})
export class TickerGroupModule {}
