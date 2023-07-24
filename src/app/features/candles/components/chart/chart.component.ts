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
import { ChartService } from './chart.service';
import { CandleInterval } from '../../types/candle-interval';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandleEntity } from '../../store/candles.state';
import { getFormattedDate } from 'src/app/shared/helpers';

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

  interval$ = this.candlesFacade.interval$;

  get loading() {
    return this.chartService.loadingController.loading;
  }

  #data$ = this.candlesFacade.candles$.pipe(
    filter((candles) => Boolean(candles.length)),
    map((candles) => this.#createData(candles))
  );

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
    private candlesFacade: CandlesFacade,
    private globalFacade: GlobalFacade,
    private candlesWebsocketService: CandlesWebsocketService,
    private chartService: ChartService,
    private candlesRestService: CandlesRestService,
    private websocketService: WebsocketService
  ) {}

  onChartInit($event: ECharts) {
    this.#chartInstance$.next($event);
  }

  #createData(candles: CandleEntity[]) {
    return candles.map(({ open, high, low, close, openTime, volume }) => ({
      date: getFormattedDate({
        msec: openTime,
      }),
      open,
      close,
      low,
      high,
      volume,
    }));
  }

  handleIntervalChange(event: MatSelectChange) {
    this.chartService.loadingController.setLoading(true);

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

  ngOnInit(): void {
    // Initial data load
    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.candlesFacade.interval$.pipe(first()),
    ]).subscribe(([symbol, interval]) => {
      this.candlesFacade.loadData({ symbol, interval });
    });

    // On websocket start
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() =>
          combineLatest([
            this.globalFacade.symbol$.pipe(first()),
            this.candlesFacade.interval$.pipe(first()),
          ])
        )
      )
      .subscribe(([symbol, interval]) => {
        this.candlesWebsocketService.subscriber.subscribe({ symbol, interval });
      });

    // REST loading
    this.candlesRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.chartService.loadingController.setLoading(true);
      });

    // REST and data complete
    this.candlesRestService.status$
      .pipe(
        filter((status) => status === 'success'),
        switchMap(() => this.#data$.pipe(first()))
      )
      .subscribe(() => {
        this.chartService.loadingController.setLoading(false);
      });

    // Update data
    this.#chartInstance$
      .pipe(
        filter(Boolean),
        switchMap(() => this.#data$)
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
