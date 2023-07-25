import { Injectable } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { getFormattedDate } from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { CandlesRestService } from '../../services/candles-rest.service';
import { CandlesService } from '../../services/candles.service';
import { CandleEntity } from '../../store/candles.state';

@Injectable({ providedIn: 'root' })
export class ChartService {
  constructor(
    private globalService: GlobalService,
    private candlesRestService: CandlesRestService,
    private candlesService: CandlesService,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  loadingController = new LoadingController(true);

  subscriber = new WebsocketSubscriber(
    1,
    this.candlesService.createStreamParams,
    this.websocketSubscribeService
  );

  interval$ = this.candlesService.interval$;

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

  loadData() {
    combineLatest([
      this.globalService.symbol$.pipe(first()),
      this.candlesService.interval$.pipe(first()),
    ]).subscribe(([symbol, interval]) => {
      this.candlesService.loadData({ symbol, interval });
    });
  }

  subscribeToStream() {
    combineLatest([
      this.globalService.symbol$.pipe(first()),
      this.candlesService.interval$.pipe(first()),
    ]).subscribe(([symbol, interval]) => {
      this.subscriber.subscribe({ symbol, interval });
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
