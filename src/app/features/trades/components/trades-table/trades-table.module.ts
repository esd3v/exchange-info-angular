import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { TradesTableComponent } from './trades-table.component';
import { WindowModule } from 'src/app/shared/components/window/window.module';

@NgModule({
  declarations: [TradesTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
    WindowModule,
  ],
  exports: [TradesTableComponent],
})
export class TradesTableModule {}
