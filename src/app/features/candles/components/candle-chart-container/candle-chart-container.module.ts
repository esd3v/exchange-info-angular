import { NgModule } from '@angular/core';

import { WindowModule } from 'src/app/shared/components/window/window.module';
import { CandleChartModule } from '../candle-chart/candle-chart.module';
import { CandleChartContainerComponent } from './candle-chart-container.component';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule, CandleChartModule, WindowModule, MatSelectModule],
  exports: [CandleChartContainerComponent],
  declarations: [CandleChartContainerComponent],
  providers: [],
})
export class CandleChartContainerModule {}
