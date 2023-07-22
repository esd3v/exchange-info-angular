import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { combineLatest, filter, first, map } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
import { TableStyleService } from 'src/app/shared/components/table/table-style.service';
import { WIDGET_TRADES_DEFAULT_LIMIT } from 'src/app/shared/config';
import {
  formatDecimal,
  formatPrice,
  getFormattedDate,
  multiplyDecimal,
} from 'src/app/shared/helpers';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { TradesFacade } from '../../services/trades-facade.service';
import { TradesEntity } from '../../store/trades.state';
import { TradesColumn } from '../../types/trades-column';
import { TradesTableService } from './trades-table.service';

@Component({
  selector: 'app-trades-table',
  templateUrl: './trades-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class TradesTableComponent implements OnInit {
  public currency$ = this.globalFacade.currency$;

  public data$ = combineLatest([
    this.tradesFacade.trades$,
    this.tickerFacade.tickSize$.pipe(filter(Boolean)),
  ]).pipe(map(([trades, tickSize]) => this.createRows(trades, tickSize)));

  public data: Row[] = [];
  public columns: TradesColumn[] = [];
  public placeholderRowsCount = WIDGET_TRADES_DEFAULT_LIMIT;

  public get loading() {
    return this.tradesTableService.loading;
  }

  public constructor(
    private tableStyleService: TableStyleService,
    private tradesFacade: TradesFacade,
    private tickerFacade: TickerFacade,
    private globalFacade: GlobalFacade,
    private tradesTableService: TradesTableService
  ) {}

  private createColumns({ base, quote }: Currency): TradesColumn[] {
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
  }

  private createRows(trades: TradesEntity[], tickSize: string): Row[] {
    return trades.map((item) => {
      const { isBuyerMaker, price, qty, time } = item;
      const formattedPrice = formatPrice(price, tickSize);
      const formattedQty = formatDecimal(qty); // TODO use stepSize from for quantity formatting
      const total = multiplyDecimal(formattedPrice, formattedQty);

      return {
        cells: [
          {
            value: formattedPrice,
            classNames: isBuyerMaker
              ? this.tableStyleService.cellNegativeClass
              : this.tableStyleService.cellPositiveClass,
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
        ],
        classNames: '',
      };
    });
  }

  public ngOnInit(): void {
    // Initial data load
    this.globalFacade.symbol$.pipe(first()).subscribe((symbol) => {
      this.tradesFacade.loadData({ symbol });
    });

    this.data$.subscribe((data) => {
      this.data = data;
    });

    this.currency$.subscribe((currency) => {
      this.columns = this.createColumns(currency);
    });

    // REST loading
    this.tradesFacade.restStatus$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.tradesTableService.setLoading(true);
      });

    // REST complete
    this.tradesFacade.restStatus$
      .pipe(filter((status) => status === 'success'))
      .subscribe(() => {
        this.tradesTableService.setLoading(false);
      });
  }
}
