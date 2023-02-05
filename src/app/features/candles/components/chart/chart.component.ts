import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { ECharts, EChartsOption } from 'echarts';
import { combineLatest, filter, map, Subject } from 'rxjs';
import { AppState } from 'src/app/store';
import { CandleInterval } from '../../models/candle-interval.model';
import { CandlesService } from '../../services/candles.service';
import { candlesSelectors } from '../../store';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit {
  private chartInstance$ = new Subject<ECharts | null>();
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

  public loading$ = this.store$
    .select(candlesSelectors.status)
    .pipe(map((status) => status === 'loading'));

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

  public constructor(
    private store$: Store<AppState>,
    private candlesService: CandlesService
  ) {}

  public onChartInit($event: ECharts) {
    this.chartInstance$.next($event);
  }

  public handleIntervalChange(event: MatSelectChange) {
    const interval = event.value as CandleInterval;

    this.candlesService.onIntervalChange(interval);
  }

  public ngOnInit(): void {
    const ohlc$ = this.store$.select(candlesSelectors.ohlc);
    const dates$ = this.store$.select(candlesSelectors.dates);
    const volumes$ = this.store$.select(candlesSelectors.volumes);

    this.store$.select(candlesSelectors.interval).subscribe((data) => {
      this.interval = data;
    });

    combineLatest([
      this.chartInstance$.pipe(filter(Boolean)),
      ohlc$.pipe(filter((item) => Boolean(item.length))),
      dates$.pipe(filter((item) => Boolean(item.length))),
      volumes$.pipe(filter((item) => Boolean(item.length))),
    ]).subscribe(([instance, ohlc, dates, volumes]) => {
      instance.setOption({
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
      });
    });
  }
}
