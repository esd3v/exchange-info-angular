import { Injectable } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';
import { LoadingController } from 'src/app/shared/loading-controller';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { TradesRestService } from '../../services/trades-rest.service';
import { TradesService } from '../../services/trades.service';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import {
  formatPrice,
  formatDecimal,
  multiplyDecimal,
  getFormattedDate,
} from 'src/app/shared/helpers';
import { Row } from 'src/app/shared/types/row';
import { TradesEntity } from '../../store/trades.state';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';

@Injectable({ providedIn: 'root' })
export class TradesTableService {
  constructor(
    private tableStyleService: TableStyleService,
    private tradesService: TradesService,
    private tradesRestService: TradesRestService,
    private tickerService: TickerService,
    private globalService: GlobalService,
    private websocketSubscribeService: WebsocketSubscribeService,
    private websocketService: WebsocketService
  ) {}

  loadingController = new LoadingController(true);

  subscriber = new WebsocketSubscriber(
    3,
    this.tradesService.createStreamParams,
    this.websocketSubscribeService
  );

  currency$ = this.globalService.currency$;

  data$ = combineLatest([
    this.tradesService.trades$.pipe(filter((trades) => Boolean(trades.length))),
    this.tickerService.tickSize$.pipe(filter(Boolean)),
  ]).pipe(map(([trades, tickSize]) => this.#createRows(trades, tickSize)));

  #createRows(trades: TradesEntity[], tickSize: string): Row[] {
    return trades.map((item) => {
      const { isBuyerMaker, price, qty, time } = item;
      const formattedPrice = formatPrice(price, tickSize);
      const formattedQty = formatDecimal(qty); // TODO use stepSize from for quantity formatting
      const total = multiplyDecimal(formattedPrice, formattedQty);

      return {
        cells: [
          {
            value: formattedPrice,
            classNames: isBuyerMaker
              ? this.tableStyleService.cellNegativeClass
              : this.tableStyleService.cellPositiveClass,
          },
          {
            value: formattedQty,
          },
          {
            value: total,
          },
          {
            value: getFormattedDate({
              msec: time,
              format: 'HH:mm:ss:SSS',
            }),
          },
        ],
        classNames: '',
      };
    });
  }

  loadData() {
    this.globalService.symbol$.pipe(first()).subscribe((symbol) => {
      this.tradesService.loadData({ symbol });
    });
  }

  subscribeToStream() {
    this.globalService.symbol$.pipe(first()).subscribe((symbol) => {
      this.subscriber.subscribe({ symbol });
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
    this.tradesRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.loadingController.setLoading(true);
      });
  }

  onRestAndDataComplete() {
    this.tradesRestService.status$
      .pipe(
        filter((status) => status === 'success'),
        switchMap(() => this.data$.pipe(first()))
      )
      .subscribe(() => {
        this.loadingController.setLoading(false);
      });
  }
}
