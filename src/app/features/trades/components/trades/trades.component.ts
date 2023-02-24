import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { map, Observable } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  getFormattedDate,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { Row } from 'src/app/shared/types/row';
import { TradesFacade } from '../../services/trades-facade.service';
import { TradesColumn } from '../../types/trades-column';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TradesComponent implements OnInit {
  public dataSource: MatTableDataSource<Row> = new MatTableDataSource();

  public tableClass = 'trades';
  public rowClass = `${this.tableClass}__row`;
  public cellClass = `${this.tableClass}__cell`;
  public cellPositiveClass = `${this.cellClass}--positive`;
  public cellNegativeClass = `${this.cellClass}--negative`;
  public cellRightClass = `${this.cellClass}--alignedRight`;

  public placeholderRows = Array<Row>(WIDGET_TRADES_DEFAULT_LIMIT).fill([
    { value: '' },
  ]);

  public columns$: Observable<TradesColumn[]> =
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

  public loading$ = this.tradesFacade.isLoading$;

  public constructor(
    private globalFacade: GlobalFacade,
    private tradesFacade: TradesFacade
  ) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  private createRows$(): Observable<Row[]> {
    return this.tradesFacade.trades$.pipe(
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
                ? this.cellNegativeClass
                : this.cellPositiveClass,
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
