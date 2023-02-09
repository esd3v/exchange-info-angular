import { NgModule } from '@angular/core';
import { TickerChangeComponent } from './ticker-change.component';
import { TickerCardModule } from '../ticker-card/ticker-card.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [TickerChangeComponent],
  imports: [CommonModule, TickerCardModule, SharedModule],
  exports: [TickerChangeComponent],
})
export class TickerChangeModule {}
