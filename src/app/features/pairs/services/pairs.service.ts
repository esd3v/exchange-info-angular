import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  first,
  map,
  mergeMap,
  timer,
} from 'rxjs';
import { WEBSOCKET_SUBSCRIPTION_DELAY } from 'src/app/shared/config';
import { getCellByColumnId, parsePair } from 'src/app/shared/helpers';
import { Column } from 'src/app/shared/types/column';
import { Row } from 'src/app/shared/types/row';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { CandlesFacade } from '../../candles/services/candles-facade.service';
import { GlobalFacade } from '../../global/services/global-facade.service';
import { OrderBookFacade } from '../../order-book/services/order-book-facade.service';
import { TickerWebsocketService } from '../../ticker/services/ticker-websocket.service';
import { TradesFacade } from '../../trades/services/trades-facade.service';

@Injectable({ providedIn: 'root' })
export class PairsService {
  public pageSymbols: string[] = [];

  private delay$ = timer(WEBSOCKET_SUBSCRIPTION_DELAY);

  // Exclude globalSymbol because we already subscribed to it
  private pageSymbolsWithoutGlobalSymbol$ =
    this.globalFacade.globalSymbolCurrent$.pipe(
      map((globalSymbol) =>
        this.pageSymbols.filter((symbol) => symbol !== globalSymbol)
      )
    );

  public constructor(
    private globalFacade: GlobalFacade,
    private websocketService: WebsocketService,
    private tradesFacade: TradesFacade,
    private candlesFacade: CandlesFacade,
    private orderBookFacade: OrderBookFacade,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  public createSymbolsFromRows = (columns: Column[], rows: Row[]) => {
    return rows.map((row) => {
      const pairCell = getCellByColumnId({ columns, id: 'pair', row });
      const { base, quote } = parsePair(pairCell.value as string, '/');

      return `${base}${quote}`;
    });
  };

  public onDataCreate(columns: Column[], pageData$: BehaviorSubject<Row[]>) {
    this.setPageSymbols$(columns, pageData$);
    this.subscribeToPageSymbols();
  }

  public onWebsocketOpen() {
    this.websocketService.open$
      .pipe(
        mergeMap(() =>
          this.pageSymbolsWithoutGlobalSymbol$.pipe(
            filter((items) => Boolean(items.length))
          )
        )
      )
      .subscribe(() => {
        this.subscribeToPageSymbols();
      });
  }

  public subscribeToPageSymbols() {
    combineLatest([
      this.pageSymbolsWithoutGlobalSymbol$,
      this.websocketService.openCurrent$,
    ]).subscribe(([symbols]) => {
      this.tickerWebsocketService.subscribe({ symbols });
    });
  }

  public unsubscribeFromPageSymbols() {
    combineLatest([
      this.pageSymbolsWithoutGlobalSymbol$,
      this.websocketService.openCurrent$,
    ]).subscribe(([symbols]) => {
      this.tickerWebsocketService.unsubscribe({ symbols });
    });
  }

  public handleCandlesOnRowClick({
    symbol,
  }: Pick<Parameters<typeof this.candlesFacade.loadData>[0], 'symbol'>) {
    this.candlesFacade.unsubscribeCurrent();

    this.candlesFacade.intervalCurrent$.subscribe((interval) => {
      this.candlesFacade.loadDataAndSubscribe(
        { symbol, interval },
        WEBSOCKET_SUBSCRIPTION_DELAY
      );
    });
  }

  public handleOrderBookOnRowClick({
    symbol,
  }: Parameters<typeof this.orderBookFacade.loadData>[0]) {
    this.orderBookFacade.unsubscribeCurrent();

    this.orderBookFacade.loadDataAndSubscribe(
      { symbol },
      WEBSOCKET_SUBSCRIPTION_DELAY
    );
  }

  public handleTradesOnRowClick({
    symbol,
  }: Parameters<typeof this.tradesFacade.loadData>[0]) {
    this.tradesFacade.unsubscribeCurrent();

    this.tradesFacade.loadDataAndSubscribe(
      { symbol },
      WEBSOCKET_SUBSCRIPTION_DELAY
    );
  }

  public setPageSymbols$(columns: Column[], pageData$: BehaviorSubject<Row[]>) {
    pageData$
      .pipe(
        first(),
        map((data) => this.createSymbolsFromRows(columns, data))
      )
      .subscribe((data) => {
        this.pageSymbols = data;
      });
  }
}
