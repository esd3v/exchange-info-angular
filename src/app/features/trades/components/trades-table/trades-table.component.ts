import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import { Currency } from 'src/app/shared/types/currency';
import { NgChanges } from 'src/app/shared/types/misc';
import { Row } from 'src/app/shared/types/row';
import { TradesStyleService } from '../../services/trades-style.service';
import { TradesColumn } from '../../types/trades-column';

@Component({
  selector: 'app-trades-table',
  templateUrl: './trades-table.component.html',
  styleUrls: ['./trades-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TradesTableComponent implements OnChanges {
  @Input() public loading: Boolean = false;
  @Input() public data: Row[] = [];
  @Input() public currency: Currency = {
    base: null,
    quote: null,
  };

  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();
  public styles = this.tradesStyleService;

  public placeholderRows = Array<Row>(WIDGET_TRADES_DEFAULT_LIMIT).fill({
    cells: [],
  });

  public displayedColumns = this.columns.map((item) => item.id);

  public get columns(): TradesColumn[] {
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
      {
        id: 'time',
        numeric: true,
        label: 'Time',
      },
    ];
  }

  public get columnLabels(): string[] {
    return this.columns.map((item) => item.label);
  }

  public constructor(private tradesStyleService: TradesStyleService) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  public ngOnChanges({ data }: NgChanges<TradesTableComponent>): void {
    if (data?.currentValue) {
      this.dataSource.data = data.currentValue;
    }
  }
}
