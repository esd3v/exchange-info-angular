import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ECharts, EChartsOption } from 'echarts';
import { BehaviorSubject, filter, first, switchMap } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandleInterval } from '../../types/candle-interval';
import { ChartService } from './chart.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  #chartInstance$ = new BehaviorSubject<ECharts | null>(null);

  #upColor = '#00da3c';

  #downColor = '#ec0000';

  #upBorderColor = '#00CF36';

  #downBorderColor = '#D50000';

  intervals: CandleInterval[] = [
    '12h',
    '15m',
    '1M',
    '1d',
    '1h',
    '1m',
    '1s',
    '1w',
    '2h',
    '30m',
    '3d',
    '3m',
    '4h',
    '5m',
    '6h',
    '8h',
  ];

  interval: CandleInterval = this.chartService.interval;

  get loading() {
    return this.chartService.loadingController.loading;
  }

  chartOptions: EChartsOption = {
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

  constructor(
    private chartService: ChartService,
    private websocketService: WebsocketService
  ) {}

  onChartInit($event: ECharts) {
    this.#chartInstance$.next($event);
  }

  handleIntervalChange(event: MatSelectChange) {
    this.chartService.loadingController.setLoading(true);

    const interval = event.value as CandleInterval;

    this.chartService.setInterval(interval);
    this.chartService.resubscribeLoadData();
  }

  ngOnInit(): void {
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === null) {
        // Load REST data only if we start the app with websockets disabled
        this.chartService.loadData();
      }
    });

    this.chartService.onWebsocketOpen();
    this.chartService.onRestLoading();
    this.chartService.onRestAndDataComplete();

    // Update data
    this.#chartInstance$
      .pipe(
        filter(Boolean),
        switchMap(() => this.chartService.data$)
      )
      .subscribe((data) => {
        const dates = data.map((item) => item.date);

        const ohlc = data.map((item) => ({
          value: [item.open, item.close, item.low, item.high],
        }));

        const volumes = data.map((item) => ({
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
      });
  }
}
