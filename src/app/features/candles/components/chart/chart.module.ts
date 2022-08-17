import { NgModule } from '@angular/core';
import { ChartComponent } from './chart.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [ChartComponent],
  imports: [
    CommonModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    WindowModule,
  ],
  exports: [ChartComponent],
})
export class ChartModule {}
