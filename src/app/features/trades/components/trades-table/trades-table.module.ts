import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TradesTableComponent } from './trades-table.component';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { SkeletonModule } from 'src/app/shared/components/skeleton/skeleton.module';

@NgModule({
  declarations: [TradesTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    SkeletonModule,
    WindowModule,
  ],
  exports: [TradesTableComponent],
})
export class TradesTableModule {}
