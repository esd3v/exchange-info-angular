import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerCardComponent } from './ticker-card.component';
import { MatCardModule } from '@angular/material/card';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [TickerCardComponent],
  imports: [CommonModule, MatCardModule, SharedModule],
  exports: [TickerCardComponent],
})
export class TickerCardModule {}
