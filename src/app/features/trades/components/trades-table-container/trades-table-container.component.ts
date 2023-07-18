import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, first, map } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { TickerFacade } from 'src/app/features/ticker/services/ticker-facade.service';
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
import { TradesStyleService } from '../../services/trades-style.service';
import { TradesWebsocketService } from '../../services/trades-websocket.service';
import { TradesEntity } from '../../store/trades.state';

@Component({
  selector: 'app-trades-table-container',
  templateUrl: './trades-table-container.component.html',
})
export class TradesTableContainerComponent
  extends LoadingController
  implements OnInit
{
  public styles = this.tradesStyleService;

  public currency$ = this.globalFacade.currency$;
  public currency!: Currency;

  public data$ = combineLatest([
    this.tradesFacade.trades$,
    this.tickerFacade.tickSize$.pipe(filter(Boolean)),
  ]).pipe(map(([trades, tickSize]) => this.createRows(trades, tickSize)));

  public data: Row[] = [];

  public constructor(
    private tradesStyleService: TradesStyleService,
    private tradesFacade: TradesFacade,
    private tickerFacade: TickerFacade,
    private tradesWebsocketService: TradesWebsocketService,
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService
  ) {
    // Set loading
    super(true);
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
              ? this.styles.cellNegativeClass
              : this.styles.cellPositiveClass,
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
      this.tradesWebsocketService.subscribe({ symbol });
    });

    this.currency$.subscribe((currency) => {
      this.currency = currency;
    });

    this.data$.subscribe((data) => {
      this.data = sortRows({
        headCellIndex: 0,
        order: 'asc',
        rows: data,
      });
    });

    this.currency$.subscribe((currency) => {
      this.currency = currency;
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
