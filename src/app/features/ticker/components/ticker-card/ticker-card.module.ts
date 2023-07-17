import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerCardComponent } from './ticker-card.component';
import { MatCardModule } from '@angular/material/card';
import { SkeletonModule } from 'src/app/shared/components/skeleton/skeleton.module';

@NgModule({
  declarations: [TickerCardComponent],
  imports: [CommonModule, MatCardModule, SkeletonModule],
  exports: [TickerCardComponent],
})
export class TickerCardModule {}
