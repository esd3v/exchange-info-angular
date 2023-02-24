import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, filter, map, mergeMap, Observable } from 'rxjs';
import { ExchangeInfoFacade } from 'src/app/features/exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  formatPrice,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { NgChanges } from 'src/app/shared/types/misc';
import { Row } from 'src/app/shared/types/row';
import { OrderBookFacade } from '../../services/order-book-facade.service';
import { OrderBookColumn } from '../../types/order-book-column';
import { OrderBookProps } from './order-book.props';

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderBookComponent implements OnInit, OnChanges {
  @Input() public type: OrderBookProps['type'] = 'asks';

  public tableClass = 'order-book';
  public rowClass = `${this.tableClass}__row`;
  public cellClass = `${this.tableClass}__cell`;
  public cellPositiveClass = `${this.cellClass}--positive`;
  public cellNegativeClass = `${this.cellClass}--negative`;
  public cellRightClass = `${this.cellClass}--alignedRight`;

  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  public placeholderRows = Array<Row>(WIDGET_DEPTH_DEFAULT_LIMIT).fill([
    { value: '' },
  ]);

  public title = this.getTitle(this.type);

  public columns$: Observable<OrderBookColumn[]> =
    this.globalFacade.currency$.pipe(
      map(({ base, quote }) => {
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
      })
    );

  public displayedColumns$ = this.columns$.pipe(
    map((item) => item.map((item) => item.id))
  );

  public columnLabels: string[] = [];

  // tickSize for price comes from exchangeInfo so we also check exchangeInfo loading
  public loading$ = combineLatest([
    this.orderBookFacade.isLoading$,
    this.exchangeInfoFacade.isLoading$,
  ]).pipe(
    map(
      ([orderBookLoading, exchangeInfoLoading]) =>
        orderBookLoading === true || exchangeInfoLoading === true
    )
  );

  public constructor(
    private orderBookFacade: OrderBookFacade,
    private globalFacade: GlobalFacade,
    private tickerFacade: TickerFacade,
    private exchangeInfoFacade: ExchangeInfoFacade
  ) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  private getTitle(type: OrderBookProps['type']) {
    return `${type === 'asks' ? 'Sell' : 'Buy'} Orders`;
  }

  private getOrderBook$() {
    return combineLatest([
      this.orderBookFacade.asks$,
      this.orderBookFacade.bids$,
    ]).pipe(map(([asks, bids]) => (this.type === 'asks' ? asks : bids)));
  }

  private createRows$(): Observable<Row[]> {
    return this.getOrderBook$().pipe(
      mergeMap((data) =>
        this.tickerFacade.tickSize$.pipe(
          filter(Boolean),
          map((tickerSize) => [data, tickerSize] as const)
        )
      ),
      map(([data, tickSize]) => {
        return data.map((item) => {
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
      })
    );
  }

  public ngOnInit(): void {
    this.createRows$().subscribe((data) => {
      this.dataSource.data = data;
    });

    this.columns$.subscribe((data) => {
      this.columnLabels = data.map((item) => item.label);
    });
  }

  public ngOnChanges({ type }: NgChanges<OrderBookComponent>) {
    if (type) {
      this.title = this.getTitle(type.currentValue);
    }
  }
}
