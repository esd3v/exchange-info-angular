import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { combineLatest, filter, first, map } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import {
  formatDecimal,
  formatPrice,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { OrderBookFacade } from '../../services/order-book-facade.service';
import { OrderBookRestService } from '../../services/order-book-rest.service';
import { OrderBookWebsocketService } from '../../services/order-book-websocket.service';
import { OrderBook } from '../../types/order-book';

@Component({
  selector: 'app-order-book-table-container',
  templateUrl: './order-book-table-container.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderBookTableContainerComponent
  extends LoadingController
  implements OnInit
{
  public currency$ = this.globalFacade.currency$;
  public currency!: Currency;

  public asksData$ = this.getData$('asks');
  public bidsData$ = this.getData$('bids');

  public asksData: Row[] = [];
  public bidsData: Row[] = [];

  public constructor(
    private orderBookWebsocketService: OrderBookWebsocketService,
    private orderBookRestService: OrderBookRestService,
    private tickerFacade: TickerFacade,
    private orderBookFacade: OrderBookFacade,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService
  ) {
    // Set loading
    super(true);
  }

  private getData$(type: 'asks' | 'bids') {
    return combineLatest([
      type === 'asks' ? this.orderBookFacade.asks$ : this.orderBookFacade.bids$,
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
    ]).pipe(
      map(([orderBook, tickSize]) => this.createRows(orderBook, tickSize))
    );
  }

  public createRows(
    orderBook: OrderBook['asks'] | OrderBook['bids'],
    tickSize: string
  ) {
    return orderBook.map((item) => {
      const [price, quantity] = item;
      const formattedPrice = formatPrice(price, tickSize);
      const formattedQuantity = formatDecimal(quantity); // TODO use stepSize from LOT_SIZE filter?
      const total = multiplyDecimal(formattedPrice, formattedQuantity);

      return [
        {
          value: formattedPrice,
        },
        {
          value: formattedQuantity,
        },
        {
          value: total,
        },
      ];
    });
  }

  public ngOnInit(): void {
    // Initial data load
    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.orderBookFacade.loadData({ symbol });
    });

    // On websocket start
    combineLatest([
      this.websocketService.status$.pipe(filter((status) => status === 'open')),
      this.globalFacade.symbol$.pipe(first()),
    ]).subscribe(([_status, symbol]) => {
      this.orderBookWebsocketService.subscribe({
        symbol,
      });
    });

    this.currency$.subscribe((currency) => {
      this.currency = currency;
    });

    this.asksData$.subscribe((data) => {
      this.asksData = data;
    });

    this.bidsData$.subscribe((data) => {
      this.bidsData = data;
    });

    // REST loading
    this.orderBookRestService.restStatus$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.setLoading(true);
      });

    // REST and data complete
    combineLatest([
      this.orderBookRestService.restStatus$.pipe(
        filter((status) => status === 'success')
      ),
      this.asksData$.pipe(filter((data) => Boolean(data.length))),
      this.bidsData$.pipe(filter((data) => Boolean(data.length))),
    ]).subscribe(() => {
      this.setLoading(false);
    });
  }
}
