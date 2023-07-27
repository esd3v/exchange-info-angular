import { NgModule } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { CandleChartComponent } from './candle-chart.component';

@NgModule({
  declarations: [CandleChartComponent],
  imports: [
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
  ],
  exports: [CandleChartComponent],
})
export class CandleChartModule {}
