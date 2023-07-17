import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PairsComponent } from './pairs.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { WindowModule } from 'src/app/shared/components/window/window.module';

@NgModule({
  declarations: [PairsComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    NgxSkeletonLoaderModule,
    WindowModule,
  ],
  exports: [PairsComponent],
})
export class PairsModule {}
