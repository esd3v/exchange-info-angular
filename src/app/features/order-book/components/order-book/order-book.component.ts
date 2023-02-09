import {
  Component,
  Input,
  OnChanges,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, map, Observable } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { formatDecimal, multiplyDecimal } from 'src/app/shared/helpers';
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
  public cellClass = `${this.tableClass}__cell`;
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

  public loading$ = this.orderBookFacade.isLoading$;

  public constructor(
    private orderBookFacade: OrderBookFacade,
    private globalFacade: GlobalFacade
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
      map((data) => {
        return data.map((item) => {
          const [price, quantity] = item;
          const dPrice = formatDecimal(price);
          const dQuantity = formatDecimal(quantity);
          const total = multiplyDecimal(dPrice, dQuantity);

          return [
            {
              value: dPrice,
            },
            {
              value: dQuantity,
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
