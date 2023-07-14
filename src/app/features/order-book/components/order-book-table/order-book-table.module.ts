import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrderBookTableComponent } from './order-book-table.component';

@NgModule({
  declarations: [OrderBookTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    SharedModule,
    NgxSkeletonLoaderModule,
  ],
  exports: [OrderBookTableComponent],
})
export class OrderBookTableModule {}
