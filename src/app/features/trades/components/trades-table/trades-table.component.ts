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
  sortRows,
} from 'src/app/shared/helpers';
import { LoadingController } from 'src/app/shared/loading-controller';
import { Currency } from 'src/app/shared/types/currency';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TradesFacade } from '../../services/trades-facade.service';
import { TradesWebsocketService } from '../../services/trades-websocket.service';
import { TradesEntity } from '../../store/trades.state';
import { TradesColumn } from '../../types/trades-column';

@Component({
  selector: 'app-trades-table',
  templateUrl: './trades-table.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class TradesTableComponent extends LoadingController implements OnInit {
  public currency$ = this.globalFacade.currency$;

  public data$ = combineLatest([
    this.tradesFacade.trades$,
    this.tickerFacade.tickSize$.pipe(filter(Boolean)),
  ]).pipe(map(([trades, tickSize]) => this.createRows(trades, tickSize)));

  public data: Row[] = [];
  public columns: TradesColumn[] = [];
  public placeholderRowsCount = WIDGET_TRADES_DEFAULT_LIMIT;

  public constructor(
    private tableStyleService: TableStyleService,
    private tradesFacade: TradesFacade,
    private tickerFacade: TickerFacade,
    private tradesWebsocketService: TradesWebsocketService,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService
  ) {
    // Set loading
    super(true);
  }

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
            className: isBuyerMaker
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

    // On websocket start
    combineLatest([
      this.globalFacade.symbol$.pipe(first()),
      this.websocketService.status$.pipe(filter((status) => status === 'open')),
    ]).subscribe(([symbol]) => {
      this.tradesWebsocketService.subscriber.subscribe({ symbol });
    });

    this.data$.subscribe((data) => {
      this.data = sortRows({
        headCellIndex: 0,
        order: 'asc',
        rows: data,
      });
    });

    this.currency$.subscribe((currency) => {
      this.columns = this.createColumns(currency);
    });

    // REST loading
    this.tradesFacade.restStatus$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.setLoading(true);
      });

    // REST and data complete
    combineLatest([
      this.tradesFacade.restStatus$.pipe(
        filter((status) => status === 'success')
      ),
      this.data$.pipe(filter((data) => Boolean(data.length))),
    ]).subscribe(() => {
      this.setLoading(false);
    });
  }
}
