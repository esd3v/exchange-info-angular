import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  getFormattedDate,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { Row } from 'src/app/shared/models/row.model';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';
import { TradesColumn } from '../../models/trades-column.model';
import { tradesSelectors } from '../../store';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TradesComponent implements OnInit {
  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  public placeholderRows = Array<Row>(WIDGET_TRADES_DEFAULT_LIMIT).fill([
    { value: '' },
  ]);

  public columns$: Observable<TradesColumn[]> = this.store$
    .select(globalSelectors.currency)
    .pipe(
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
          {
            id: 'time',
            numeric: true,
            label: 'Time',
          },
        ];
      })
    );

  public displayedColumns$ = this.columns$.pipe(
    map((item) => item.map((item) => item.id))
  );

  public columnLabels: string[] = [];

  private tradesStatus$ = this.store$.select(tradesSelectors.status);

  public loading$ = this.tradesStatus$.pipe(
    map((status) => status === 'loading')
  );

  public constructor(private store$: Store<AppState>) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  private getTrades$() {
    const trades$ = this.store$.select(tradesSelectors.data);

    return trades$;
  }

  private createRows$(): Observable<Row[]> {
    return this.getTrades$().pipe(
      map((data) => {
        return data.map((item) => {
          const { isBuyerMaker, price, qty, time } = item;
          const dPrice = formatDecimal(price);
          const dQty = formatDecimal(qty);
          const total = multiplyDecimal(dPrice, dQty);

          return [
            {
              value: dPrice,
              className: isBuyerMaker
                ? 'trades__cell--positive'
                : 'trades__cell--negative',
            },
            {
              value: dQty,
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
}
