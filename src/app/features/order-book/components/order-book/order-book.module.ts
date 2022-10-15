import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { OrderBookComponent } from './order-book.component';

@NgModule({
  declarations: [OrderBookComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    SharedModule,
    NgxSkeletonLoaderModule,
  ],
  exports: [OrderBookComponent],
})
export class OrderBookModule {}
