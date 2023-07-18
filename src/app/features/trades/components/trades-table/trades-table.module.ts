import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TradesTableComponent } from './trades-table.component';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { SkeletonModule } from 'src/app/shared/components/skeleton/skeleton.module';
import { TableModule } from 'src/app/shared/components/table/table.module';

@NgModule({
  declarations: [TradesTableComponent],
  imports: [
    CommonModule,
    MatPaginatorModule,
    SkeletonModule,
    WindowModule,
    TableModule,
  ],
  exports: [TradesTableComponent],
})
export class TradesTableModule {}
