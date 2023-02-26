import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { combineLatest, filter, map, mergeMap, Observable } from 'rxjs';
import { ExchangeInfoFacade } from 'src/app/features/exchange-info/services/exchange-info-facade.service';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  formatPrice,
  getFormattedDate,
  multiplyDecimal,
  sortRows,
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

  // tickSize for price comes from exchangeInfo so we also check exchangeInfo loading
  public loading$ = combineLatest([
    this.tradesFacade.isLoading$,
    this.exchangeInfoFacade.isLoading$,
  ]).pipe(
    map(
      ([tradesLoading, exchangeInfoLoading]) =>
        tradesLoading || exchangeInfoLoading
    )
  );

  public constructor(
    private globalFacade: GlobalFacade,
    private tradesFacade: TradesFacade,
    private tickerFacade: TickerFacade,
    private exchangeInfoFacade: ExchangeInfoFacade
  ) {}

  public trackRow(_index: number, _item: Row) {
    return _index;
  }

  private createRows$(): Observable<Row[]> {
    return this.tradesFacade.trades$.pipe(
      mergeMap((data) =>
        this.tickerFacade.tickSize$.pipe(
          filter(Boolean),
          map((tickSize) => [data, tickSize] as const)
        )
      ),
      map(([data, tickSize]) => {
        return data.map((item) => {
          const { isBuyerMaker, price, qty, time } = item;
          const formattedPrice = formatPrice(price, tickSize);
          const formattedQty = formatDecimal(qty);
          const total = multiplyDecimal(formattedPrice, formattedQty);

          return [
            {
              value: formattedPrice,
              className: isBuyerMaker
                ? this.cellNegativeClass
                : this.cellPositiveClass,
            },
            {
              value: formattedQty,
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
      this.dataSource.data = sortRows({
        headCellIndex: 0,
        order: 'asc',
        rows: data,
      });
    });

    this.columns$.subscribe((data) => {
      this.columnLabels = data.map((item) => item.label);
    });
  }
}
