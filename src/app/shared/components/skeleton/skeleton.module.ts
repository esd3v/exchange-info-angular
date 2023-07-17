import { NgModule } from '@angular/core';
import { SkeletonComponent } from './skeleton.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  imports: [NgxSkeletonLoaderModule],
  exports: [SkeletonComponent],
  declarations: [SkeletonComponent],
})
export class SkeletonModule {}
