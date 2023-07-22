import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { combineLatest, filter, first, map } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  formatPrice,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { OrderBookFacade } from '../../services/order-book-facade.service';
import { OrderBookRestService } from '../../services/order-book-rest.service';
import { OrderBookTableContainerService } from '../../services/order-book-table-container.service';
import { OrderBook } from '../../types/order-book';
import { OrderBookColumn } from '../../types/order-book-column';

@Component({
  selector: 'app-order-book-table-container',
  templateUrl: './order-book-table-container.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class OrderBookTableContainerComponent implements OnInit {
  public currency$ = this.globalFacade.currency$;

  public asksData$ = this.getData$('asks');
  public bidsData$ = this.getData$('bids');

  public asksData: Row[] = [];
  public bidsData: Row[] = [];

  public columns: OrderBookColumn[] = [];
  public placeholderRowsCount = WIDGET_DEPTH_DEFAULT_LIMIT;

  public get loading() {
    return this.orderBookTableContainerService.loading;
  }

  public constructor(
    private orderBookRestService: OrderBookRestService,
    private tickerFacade: TickerFacade,
    private orderBookFacade: OrderBookFacade,
    private globalFacade: GlobalFacade,
    private tableStyleService: TableStyleService,
    private orderBookTableContainerService: OrderBookTableContainerService
  ) {}

  private createColumns({ base, quote }: Currency): OrderBookColumn[] {
    return [
      {
        id: 'price',
        numeric: false,
        label: `Price${quote ? ` (${quote})` : ''}`,
      },
      {
        id: 'amount',
        numeric: true,
        label: `Amount${base ? ` (${base})` : ''}`,
      },
      {
        id: 'total',
        numeric: true,
        label: 'Total',
      },
    ];
  }

  private getData$(type: 'asks' | 'bids') {
    return combineLatest([
      type === 'asks' ? this.orderBookFacade.asks$ : this.orderBookFacade.bids$,
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
    ]).pipe(
      map(([orderBook, tickSize]) => this.createRows(orderBook, tickSize, type))
    );
  }

  public createRows(
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

  public ngOnInit(): void {
    // Initial data load
    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.orderBookFacade.loadData({ symbol });
    });

    this.currency$.subscribe((currency) => {
      this.columns = this.createColumns(currency);
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
        this.orderBookTableContainerService.setLoading(true);
      });

    // REST complete
    this.orderBookRestService.restStatus$
      .pipe(filter((status) => status === 'success'))
      .subscribe(() => {
        this.orderBookTableContainerService.setLoading(false);
      });
  }
}
