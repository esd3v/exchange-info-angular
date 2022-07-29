import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PairsComponent } from './pairs.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [PairsComponent],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, SharedModule],
  exports: [PairsComponent],
})
export class PairsModule {}
