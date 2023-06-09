import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ECharts, EChartsOption } from 'echarts';
import { BehaviorSubject, combineLatest, filter } from 'rxjs';
import { CandlesFacade } from '../../services/candles-facade.service';
import { CandleInterval } from '../../types/candle-interval';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  private chartInstance$ = new BehaviorSubject<ECharts | null>(null);
  private upColor = '#00da3c';
  private downColor = '#ec0000';
  private barMinWidth = 6;

  public intervals: CandleInterval[] = [
    '12h',
    '15m',
    '1M',
    '1d',
    '1h',
    '1m',
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

  public interval!: CandleInterval;

  public loading$ = this.candlesFacade.isLoading$;

  public chartOptions: EChartsOption = {
    backgroundColor: '#fff',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      backgroundColor: 'rgba(245, 245, 245, 0.8)',
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#000',
      },
    },
    axisPointer: {
      label: {
        backgroundColor: '#777',
      },
    },
    grid: [
      {
        width: 'auto',
        height: '70%',
        top: 8,
        left: 45,
        right: this.barMinWidth,
      },
      {
        width: 'auto',
        height: '15%',
        left: 40,
        right: this.barMinWidth,
        bottom: 19,
      },
    ],
    dataZoom: {
      type: 'inside',
      xAxisIndex: [0, 1],
      start: 75,
      end: 100,
      maxSpan: 25,
      minSpan: 5,
    },
    xAxis: [
      {
        show: true,
        type: 'category',
        data: [],
        gridIndex: 0,
        boundaryGap: false,
      },
      {
        show: true,
        type: 'category',
        gridIndex: 1,
        data: [],
        boundaryGap: false,
        axisLabel: {
          show: true,
        },
      },
    ],
    yAxis: [
      {
        show: true,
        scale: true,
        gridIndex: 0,
        splitNumber: 7,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      {
        show: true,
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: 'OHLC',
        type: 'candlestick',
        data: [],
        barMinWidth: this.barMinWidth,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: this.upColor,
          color0: this.downColor,
          borderColor: undefined,
          borderColor0: undefined,
        },
      },
      {
        name: 'Volume',
        type: 'bar',
        data: [],
        barMinWidth: this.barMinWidth,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: '#5e71ae',
          opacity: 0.3,
        },
      },
    ],
  };

  public mergeOptions: EChartsOption = {};

  public constructor(private candlesFacade: CandlesFacade) {}

  public onChartInit($event: ECharts) {
    this.chartInstance$.next($event);
  }

  public handleIntervalChange(event: MatSelectChange) {
    const interval = event.value as CandleInterval;

    this.candlesFacade.onIntervalChange(interval);
  }

  public ngOnInit(): void {
    this.candlesFacade.intervalCurrent$.subscribe((data) => {
      this.interval = data;
    });

    combineLatest([
      this.chartInstance$.pipe(filter(Boolean)),
      this.candlesFacade.ohlc$.pipe(filter((item) => Boolean(item.length))),
      this.candlesFacade.dates$.pipe(filter((item) => Boolean(item.length))),
      this.candlesFacade.volumes$.pipe(filter((item) => Boolean(item.length))),
    ]).subscribe(([_instance, ohlc, dates, volumes]) => {
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
