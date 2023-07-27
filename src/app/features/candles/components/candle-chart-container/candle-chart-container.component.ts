import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { EChartsOption } from 'echarts';
import { first } from 'rxjs';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandleInterval } from '../../types/candle-interval';
import { CandleChartData } from '../candle-chart/candle-chart.component';
import { CandleChartContainerService } from './candle-chart-container.service';

@Component({
  selector: 'app-candle-chart-container',
  templateUrl: './candle-chart-container.component.html',
  styleUrls: ['./candle-chart-container.component.scss'],
})
export class CandleChartContainerComponent implements OnInit {
  constructor(
    private websocketService: WebsocketService,
    private candleChartContainerService: CandleChartContainerService
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

    this.candleChartContainerService.resubscribeLoadData();
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
    this.websocketService.status$.pipe(first()).subscribe((status) => {
      if (status === null) {
        // Load REST data only if we start the app with websockets disabled
        this.candleChartContainerService.loadData();
      }
    });

    this.candleChartContainerService.onWebsocketOpen();
    this.candleChartContainerService.onRestLoading();
    this.candleChartContainerService.onRestAndDataComplete();
  }
}
