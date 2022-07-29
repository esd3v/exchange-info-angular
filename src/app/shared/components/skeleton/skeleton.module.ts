import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SkeletonComponent } from './skeleton.component';

@NgModule({
  declarations: [SkeletonComponent],
  imports: [CommonModule, NgxSkeletonLoaderModule],
  exports: [SkeletonComponent],
})
export class SkeletonModule {}
