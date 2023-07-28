import { Injectable } from '@angular/core';
import { LoadingController } from 'src/app/shared/loading-controller';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { CandlesService } from '../../services/candles.service';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { WIDGET_CHART_DEFAULT_CANDLEINTERVAL } from 'src/app/shared/config';
import { CandleInterval } from '../../types/candle-interval';
import { filter, switchMap, first, map } from 'rxjs';
import { CandlesRestService } from '../../services/candles-rest.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { getFormattedDate } from 'src/app/shared/helpers';
import { CandleEntity } from '../../store/candles.state';
import { CandleChartData } from '../candle-chart/candle-chart.component';

@Injectable({ providedIn: 'root' })
export class CandleChartContainerService {
  constructor(
    private websocketService: WebsocketService,
    private candlesRestService: CandlesRestService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private globalService: GlobalService,
    private candlesService: CandlesService
  ) {}

  #globalPair$ = this.globalService.pair$;

  data$ = this.candlesService.candles$.pipe(
    filter((candles) => Boolean(candles.length)),
    map((candles) => this.#createData(candles))
  );

  loadingController = new LoadingController(true);

  subscriber = new WebsocketSubscriber(
    1,
    this.candlesService.createStreamParams,
    this.websocketSubscribeService
  );

  interval: CandleInterval = WIDGET_CHART_DEFAULT_CANDLEINTERVAL;

  #createData(candles: CandleEntity[]): CandleChartData {
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

  loadData() {
    this.#globalPair$.pipe(first()).subscribe((globalPair) => {
      this.candlesService.loadData({
        symbol: globalPair.symbol,
        interval: this.interval,
      });
    });
  }

  #subscribeToStream() {
    this.#globalPair$.pipe(first()).subscribe((globalPair) => {
      this.subscriber.subscribeToStream({
        symbol: globalPair.symbol,
        interval: this.interval,
      });
    });
  }

  subscribeLoadData() {
    this.#subscribeToStream();

    this.subscriber.subscribed$.subscribe(() => {
      this.loadData();
    });
  }

  resubscribeLoadData() {
    this.subscriber.unsubscribeFromCurrentStream();

    this.subscriber.unsubscribed$.subscribe(() => {
      this.subscribeLoadData();
    });
  }

  onWebsocketOpen() {
    this.websocketService.status$
      .pipe(filter((status) => status === 'open'))
      .subscribe(() => {
        this.subscribeLoadData();
      });
  }

  onRestLoading() {
    this.candlesRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.loadingController.setLoading(true);
      });
  }

  onRestAndDataComplete() {
    this.candlesRestService.status$
      .pipe(
        filter((status) => status === 'success'),
        switchMap(() => this.data$.pipe(first()))
      )
      .subscribe(() => {
        this.loadingController.setLoading(false);
      });
  }
}
