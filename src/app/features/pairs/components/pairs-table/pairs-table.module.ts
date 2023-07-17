import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { PairsTableComponent } from './pairs-table.component';
import { SkeletonModule } from 'src/app/shared/components/skeleton/skeleton.module';

@NgModule({
  declarations: [PairsTableComponent],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, SkeletonModule],
  exports: [PairsTableComponent],
})
export class PairsTableModule {}
