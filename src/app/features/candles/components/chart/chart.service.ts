import { Injectable } from '@angular/core';
import { filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { WIDGET_CHART_DEFAULT_CANDLEINTERVAL } from 'src/app/shared/config';
import { getFormattedDate } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { CandlesRestService } from '../../services/candles-rest.service';
import { CandlesService } from '../../services/candles.service';
import { CandleEntity } from '../../store/candles.state';
import { CandleInterval } from '../../types/candle-interval';

@Injectable({ providedIn: 'root' })
export class ChartService {
  constructor(
    private globalService: GlobalService,
    private candlesRestService: CandlesRestService,
    private candlesService: CandlesService,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  get #globalSymbol() {
    return this.globalService.symbol;
  }

  loadingController = new LoadingController(true);

  subscriber = new WebsocketSubscriber(
    1,
    this.candlesService.createStreamParams,
    this.websocketSubscribeService
  );

  interval: CandleInterval = WIDGET_CHART_DEFAULT_CANDLEINTERVAL;

  data$ = this.candlesService.candles$.pipe(
    filter((candles) => Boolean(candles.length)),
    map((candles) => this.#createData(candles))
  );

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

  setInterval(interval: CandleInterval) {
    this.interval = interval;
  }

  loadData() {
    this.candlesService.loadData({
      symbol: this.#globalSymbol,
      interval: this.interval,
    });
  }

  subscribeToStream() {
    this.subscriber.subscribe({
      symbol: this.#globalSymbol,
      interval: this.interval,
    });
  }

  resubscribeLoadData() {
    this.subscriber.unsubscribeCurrent();

    this.subscriber.unsubscribed$.subscribe(() => {
      this.subscribeLoadData();
    });
  }

  subscribeLoadData() {
    this.subscribeToStream();

    this.subscriber.subscribed$.subscribe(() => {
      this.loadData();
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
