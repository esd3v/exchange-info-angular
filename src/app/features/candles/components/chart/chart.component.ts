import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ECharts, EChartsOption } from 'echarts';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  switchMap,
} from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { CandlesFacade } from '../../services/candles-facade.service';
import { CandlesRestService } from '../../services/candles-rest.service';
import { CandlesWebsocketService } from '../../services/candles-websocket.service';
import { ChartService } from '../../services/chart.service';
import { CandleInterval } from '../../types/candle-interval';

type Options = {
  xAxis: [
    {
      data: string[];
    },
    {
      data: string[];
    }
  ];
  series: [
    {
      data: (string | number)[][];
    },
    {
      data: string[];
    }
  ];
};

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

  public interval$ = this.candlesFacade.interval$;

  public get loading() {
    return this.chartService.loading;
  }

  private options$ = combineLatest([
    this.candlesFacade.dates$.pipe(filter((item) => Boolean(item.length))),
    this.candlesFacade.volumes$.pipe(filter((item) => Boolean(item.length))),
    this.candlesFacade.ohlc$.pipe(filter((item) => Boolean(item.length))),
  ]).pipe(
    map(([dates, volumes, ohlc]) => this.createOptions(dates, volumes, ohlc))
  );

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

  public constructor(
    private candlesFacade: CandlesFacade,
    private globalFacade: GlobalFacade,
    private candlesWebsocketService: CandlesWebsocketService,
    private chartService: ChartService,
    private candlesRestService: CandlesRestService
  ) {}

  public onChartInit($event: ECharts) {
    this.chartInstance$.next($event);
  }

  private createOptions(
    dates: string[],
    volumes: string[],
    ohlc: (string | number)[][]
  ): Options {
    return {
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

  public handleIntervalChange(event: MatSelectChange) {
    const interval = event.value as CandleInterval;

    this.candlesWebsocketService.subscriber.unsubscribeCurrent();

    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.candlesWebsocketService.subscriber.subscribe({ symbol, interval });
    });

    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.candlesWebsocketService.subscriber.resubscribed$.pipe(first()),
    ]).subscribe(([symbol]) => {
      this.candlesFacade.loadData({ symbol, interval });
    });
  }

  public ngOnInit(): void {
    // Initial data load
    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.candlesFacade.interval$.pipe(first()),
    ]).subscribe(([symbol, interval]) => {
      this.candlesFacade.loadData({ symbol, interval });
    });

    // REST loading
    this.candlesRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.chartService.setLoading(true);
      });

    // REST complete
    this.candlesRestService.status$
      .pipe(filter((status) => status === 'success'))
      .subscribe(() => {
        this.chartService.setLoading(false);
      });

    // Update data
    this.chartInstance$
      .pipe(
        filter(Boolean),
        switchMap(() => this.options$)
      )
      .subscribe((options) => {
        this.mergeOptions = options;
      });
  }
}
