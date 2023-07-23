import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
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
import { OrderBook } from '../../types/order-book';
import { OrderBookColumn } from '../../types/order-book-column';
import { OrderBookTableContainerService } from './order-book-table-container.service';

@Component({
  selector: 'app-order-book-table-container',
  templateUrl: './order-book-table-container.component.html',
})
export class OrderBookTableContainerComponent implements OnInit {
  #currency$ = this.globalFacade.currency$;

  #asksData$ = this.#getData$('asks');

  #bidsData$ = this.#getData$('bids');

  asksData: Row[] = [];

  bidsData: Row[] = [];

  columns: OrderBookColumn[] = [];

  placeholderRowsCount = WIDGET_DEPTH_DEFAULT_LIMIT;

  get loading() {
    return this.orderBookTableContainerService.loadingController.loading;
  }

  constructor(
    private orderBookRestService: OrderBookRestService,
    private tickerFacade: TickerFacade,
    private orderBookFacade: OrderBookFacade,
    private globalFacade: GlobalFacade,
    private tableStyleService: TableStyleService,
    private orderBookTableContainerService: OrderBookTableContainerService
  ) {}

  #createColumns({ base, quote }: Currency): OrderBookColumn[] {
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

  #getData$(type: 'asks' | 'bids') {
    return combineLatest([
      type === 'asks'
        ? this.orderBookFacade.asks$.pipe(
            filter((asks) => Boolean(asks.length))
          )
        : this.orderBookFacade.bids$.pipe(
            filter((bids) => Boolean(bids.length))
          ),
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
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

  ngOnInit(): void {
    // Initial data load
    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.orderBookFacade.loadData({ symbol });
    });

    this.#currency$.subscribe((currency) => {
      this.columns = this.#createColumns(currency);
    });

    this.#asksData$.subscribe((data) => {
      this.asksData = data;
    });

    this.#bidsData$.subscribe((data) => {
      this.bidsData = data;
    });

    // REST loading
    this.orderBookRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.orderBookTableContainerService.loadingController.setLoading(true);
      });

    // REST and data complete
    this.orderBookRestService.status$
      .pipe(
        filter((status) => status === 'success'),
        switchMap(() =>
          combineLatest([this.#asksData$, this.#bidsData$]).pipe(first())
        )
      )
      .subscribe(() => {
        this.orderBookTableContainerService.loadingController.setLoading(false);
      });
  }
}
