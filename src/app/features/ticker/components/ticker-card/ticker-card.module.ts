import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TickerCardComponent } from './ticker-card.component';
import { MatCardModule } from '@angular/material/card';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  declarations: [TickerCardComponent],
  imports: [CommonModule, MatCardModule, NgxSkeletonLoaderModule],
  exports: [TickerCardComponent],
})
export class TickerCardModule {}
