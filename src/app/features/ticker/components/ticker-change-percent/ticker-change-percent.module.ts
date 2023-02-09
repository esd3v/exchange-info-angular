import { NgModule } from '@angular/core';
import { TickerCardModule } from '../ticker-card/ticker-card.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { TickerChangePercentComponent } from './ticker-change-percent.component';

@NgModule({
  declarations: [TickerChangePercentComponent],
  imports: [CommonModule, TickerCardModule, SharedModule],
  exports: [TickerChangePercentComponent],
})
export class TickerChangePercentModule {}
