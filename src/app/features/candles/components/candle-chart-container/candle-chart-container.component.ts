import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { EChartsOption } from 'echarts';
import { CandleInterval } from '../../types/candle-interval';
import { CandleChartData } from '../candle-chart/candle-chart.component';
import { CandleChartContainerService } from './candle-chart-container.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { filter, first } from 'rxjs';

@Component({
  selector: 'app-candle-chart-container',
  templateUrl: './candle-chart-container.component.html',
  styleUrls: ['./candle-chart-container.component.scss'],
})
export class CandleChartContainerComponent implements OnInit {
  constructor(
    private candleChartContainerService: CandleChartContainerService,
    private websocketService: WebsocketService,
  ) {}

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

  get interval() {
    return this.candleChartContainerService.interval;
  }

  data: CandleChartData = [];

  loadingController = this.candleChartContainerService.loadingController;

  mergeOptions: EChartsOption = {};

  handleIntervalChange(event: MatSelectChange) {
    const interval = event.value as CandleInterval;

    this.loadingController.setLoading(true);

    this.candleChartContainerService.interval = interval;

    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === 'closed') {
        this.candleChartContainerService.loadData();
      } else {
        this.candleChartContainerService.resubscribeLoadData();
      }
    });
  }

  #onDataupdate() {
    this.candleChartContainerService.data$.subscribe((data) => {
      this.data = data;
    });
  }

  handleChartInit() {
    this.#onDataupdate();
  }

  ngOnInit(): void {
    this.candleChartContainerService.onRestLoading();
  }
}
