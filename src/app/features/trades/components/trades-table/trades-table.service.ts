import { Injectable } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
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
import { TradesEntity } from '../../store/trades.state';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { Row } from '../../../../shared/table/types/row';

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

  globalCurrency$ = this.globalService.currency$;

  #globalPair$ = this.globalService.pair$;

  data$ = combineLatest([
    this.tradesService.trades$.pipe(filter((trades) => Boolean(trades.length))),
    this.tickerService.globalTicker$.pipe(filter(Boolean)),
  ]).pipe(
    map(([trades, globalTicker]) =>
      this.#createRows(trades, globalTicker.tickSize)
    )
  );

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
            classNames: [
              isBuyerMaker
                ? this.tableStyleService.cellNegativeClass
                : this.tableStyleService.cellPositiveClass,
            ],
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
              format: 'HH:mm:ss',
            }),
          },
        ],
      };
    });
  }

  loadData() {
    this.#globalPair$.pipe(first()).subscribe((globalPair) => {
      this.tradesService.loadData({ symbol: globalPair.symbol });
    });
  }

  subscribeToStream() {
    this.#globalPair$.pipe(first()).subscribe((globalPair) => {
      this.subscriber.subscribeToStream({ symbol: globalPair.symbol });
    });
  }

  resubscribeLoadData() {
    this.subscriber.unsubscribeFromCurrentStream();

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
