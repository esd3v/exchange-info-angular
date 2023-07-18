import { NgModule } from '@angular/core';
import { TableComponent } from './table.component';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from '../skeleton/skeleton.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [TableComponent],
  imports: [CommonModule, SkeletonModule, MatPaginatorModule, MatTableModule],
  exports: [TableComponent],
})
export class TableModule {}
