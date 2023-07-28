import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { ECharts, EChartsOption } from 'echarts';
import { NgChanges } from 'src/app/shared/types/misc';

export type CandleChartData = {
  date: string;
  open: string;
  close: string;
  low: string;
  high: string;
  volume: string;
}[];

@Component({
  selector: 'app-candle-chart',
  templateUrl: './candle-chart.component.html',
  styleUrls: ['./candle-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandleChartComponent implements OnChanges {
  @Input() loading: boolean = false;

  @Input() data: CandleChartData = [];

  @Output() chartInit: EventEmitter<ECharts> = new EventEmitter();

  constructor() {}

  #upColor = '#00da3c';

  #downColor = '#ec0000';

  #upBorderColor = '#00CF36';

  #downBorderColor = '#D50000';

  options: EChartsOption = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    grid: [
      {
        top: 10,
        left: 55,
        right: 8,
        bottom: 180,
      },
      {
        left: 55,
        right: 8,
        height: 80,
        bottom: 60,
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 75,
        end: 100,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: 10,
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: [],
        boundaryGap: false,
        axisLine: {
          onZero: false,
        },
        splitLine: {
          show: false,
        },
        min: 'dataMin',
        max: 'dataMax',
      },
      {
        type: 'category',
        gridIndex: 1,
        data: [],
        boundaryGap: false,
        axisLine: {
          onZero: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        type: 'candlestick',
        data: [],
        itemStyle: {
          color: this.#upColor,
          color0: this.#downColor,
          borderColor: this.#upBorderColor,
          borderColor0: this.#downBorderColor,
          borderColorDoji: this.#upBorderColor,
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        data: [],
        xAxisIndex: 1,
        yAxisIndex: 1,
        large: true,
      },
    ],
  };

  mergeOptions: EChartsOption = {};

  handleChartInit($event: ECharts) {
    this.chartInit.emit($event);
  }

  ngOnChanges({ data }: NgChanges<CandleChartComponent>): void {
    if (data?.currentValue) {
      const dates = data.currentValue.map((item) => item.date);

      const ohlc = data.currentValue.map((item) => ({
        value: [item.open, item.close, item.low, item.high],
      }));

      const volumes = data.currentValue.map((item) => ({
        value: item.volume,
        itemStyle: {
          color: item.open > item.close ? this.#downColor : this.#upColor,
          opacity: 0.3,
        },
      }));

      this.mergeOptions = {
        xAxis: [
          {
            data: dates,
          },
          {
            data: volumes,
          },
        ],
        series: [
          {
            data: ohlc,
          },
          {
            data: volumes,
          },
        ],
      };
    }
  }
}
