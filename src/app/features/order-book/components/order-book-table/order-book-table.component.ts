import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { WIDGET_DEPTH_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { OrderBookStyleService } from '../../services/order-book-style.service';
import { OrderBookColumn } from '../../types/order-book-column';
import { OrderBookProps } from './order-book-table.props';

@Component({
  selector: 'app-order-book-table',
  templateUrl: './order-book-table.component.html',
  styleUrls: ['./order-book-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrderBookTableComponent implements OnChanges {
  @Input() public type: OrderBookProps['type'] = 'asks';
  @Input() public loading: Boolean = false;
  @Input() public data: Row[] = [];
  @Input() public currency: Currency = {
    base: null,
    quote: null,
  };

  public placeholderRows = Array<Row>(WIDGET_DEPTH_DEFAULT_LIMIT).fill({
    cells: [],
  });

  public dataSource: MatTableDataSource<Row> = new MatTableDataSource(
    this.data
  );

  public title = this.getTitle(this.type);

  public displayedColumns = this.columns.map((item) => item.id);

  public styles = this.orderBookStyleService;

  public get columnLabels(): string[] {
    return this.columns.map((item) => item.label);
  }

  public get columns(): OrderBookColumn[] {
    return [
      {
        id: 'price',
        numeric: false,
        label: `Price${this.currency.quote ? ` (${this.currency.quote})` : ''}`,
      },
      {
        id: 'amount',
        numeric: true,
        label: `Amount${this.currency.base ? ` (${this.currency.base})` : ''}`,
      },
      {
        id: 'total',
        numeric: true,
        label: 'Total',
      },
    ];
  }

  public constructor(private orderBookStyleService: OrderBookStyleService) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  private getTitle(type: OrderBookProps['type']) {
    return `${type === 'asks' ? 'Sell' : 'Buy'} Orders`;
  }

  public ngOnChanges({ type, data }: SimpleChanges) {
    if (data?.currentValue) {
      this.dataSource.data = data.currentValue;
    }

    if (type) {
      this.title = this.getTitle(type.currentValue);
    }
  }
}
