import { Injectable } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import {
  formatDecimal,
  formatPrice,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { OrderBookRestService } from '../../services/order-book-rest.service';
import { OrderBookService } from '../../services/order-book.service';
import { OrderBook } from '../../types/order-book';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TableStyleService } from 'src/app/shared/table/components/table/table-style.service';
import { Row } from '../../../../shared/table/types/row';

@Injectable({ providedIn: 'root' })
export class OrderBookTablesService {
  constructor(
    private orderBookRestService: OrderBookRestService,
    private tickerService: TickerService,
    private globalService: GlobalService,
    private tableStyleService: TableStyleService,
    private orderBookService: OrderBookService,
    private websocketService: WebsocketService,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  get #globalSymbol() {
    return this.globalService.symbol;
  }

  get currency() {
    return this.globalService.currency;
  }

  loadingController = new LoadingController(true);

  asksData$ = this.#getData$('asks');

  bidsData$ = this.#getData$('bids');

  subscriber = new WebsocketSubscriber(
    4,
    this.orderBookService.createStreamParams,
    this.websocketSubscribeService
  );

  #getData$(type: 'asks' | 'bids') {
    return combineLatest([
      type === 'asks'
        ? this.orderBookService.asks$.pipe(
            filter((asks) => Boolean(asks.length))
          )
        : this.orderBookService.bids$.pipe(
            filter((bids) => Boolean(bids.length))
          ),
      this.tickerService.globalTickerTickSize$.pipe(filter(Boolean)),
    ]).pipe(
      map(([orderBook, tickSize]) =>
        this.#createRows(orderBook, tickSize, type)
      )
    );
  }

  #createRows(
    orderBook: OrderBook['asks'] | OrderBook['bids'],
    tickSize: string,
    type: 'asks' | 'bids'
  ): Row[] {
    return orderBook.map((item) => {
      const [price, quantity] = item;
      const formattedPrice = formatPrice(price, tickSize);
      const formattedQuantity = formatDecimal(quantity); // TODO use stepSize from LOT_SIZE filter?
      const total = multiplyDecimal(formattedPrice, formattedQuantity);

      return {
        cells: [
          {
            value: formattedPrice,
            classNames:
              type === 'bids'
                ? this.tableStyleService.cellPositiveClass
                : this.tableStyleService.cellNegativeClass,
          },
          {
            value: formattedQuantity,
          },
          {
            value: total,
          },
        ],
        classNames: '',
      };
    });
  }

  loadData() {
    this.orderBookService.loadData({ symbol: this.#globalSymbol });
  }

  subscribeToStream() {
    this.subscriber.subscribeToStream({
      symbol: this.#globalSymbol,
      limit: WIDGET_DEPTH_DEFAULT_LIMIT,
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
    this.orderBookRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.loadingController.setLoading(true);
      });
  }

  onRestAndDataComplete() {
    this.orderBookRestService.status$
      .pipe(
        filter((status) => status === 'success'),
        switchMap(() =>
          combineLatest([this.asksData$, this.bidsData$]).pipe(first())
        )
      )
      .subscribe(() => {
        this.loadingController.setLoading(false);
      });
  }
}
