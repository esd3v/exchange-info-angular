import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { GlobalService } from '../../global/services/global.service';
import { tickerActions, tickerSelectors } from '../store';
import { TickerEntity } from '../store/ticker.state';
import { WebsocketTicker } from '../types/websocket-ticker';
import { WebsocketTickerStreamParams } from '../types/websocket-ticker-stream-params';
import { WebsocketSubscriber } from 'src/app/websocket/websocket-subscriber';
import { WebsocketSubscribeService } from 'src/app/websocket/services/websocket-subscribe.service';

@Injectable({
  providedIn: 'root',
})
export class TickerService {
  constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService,
    private websocketSubscribeService: WebsocketSubscribeService
  ) {}

  createStreamParams = ({ symbols }: WebsocketTickerStreamParams) =>
    symbols.map((item) => `${item.toLowerCase()}@ticker`);

  singleSubscriber = new WebsocketSubscriber(
    2,
    this.createStreamParams,
    this.websocketSubscribeService
  );

  multipleSubscriber = new WebsocketSubscriber(
    5,
    this.createStreamParams,
    this.websocketSubscribeService
  );

  get #globalSymbol() {
    return this.globalService.symbol;
  }

  tickers$ = this.store$.select(tickerSelectors.tickers);

  globalTickerLastPrice$ = this.store$.select(
    tickerSelectors.lastPrice(this.#globalSymbol)
  );

  globalTickerTickSize$ = this.store$.select(
    tickerSelectors.tickSize(this.#globalSymbol)
  );

  globalTickerFormattedLastPrice$ = this.store$.select(
    tickerSelectors.formattedLastPrice(this.#globalSymbol)
  );

  globalTickerPrevLastPrice$ = this.store$.select(
    tickerSelectors.prevLastPrice(this.#globalSymbol)
  );

  globalTickerPriceChange$ = this.store$.select(
    tickerSelectors.priceChange(this.#globalSymbol)
  );

  globalTickerPriceChangePercent$ = this.store$.select(
    tickerSelectors.priceChangePercent(this.#globalSymbol)
  );

  globalTickerLastQuantity$ = this.store$.select(
    tickerSelectors.lastQuantity(this.#globalSymbol)
  );

  globalTickerNumberOfTrades$ = this.store$.select(
    tickerSelectors.numberOfTrades(this.#globalSymbol)
  );

  handleWebsocketData({ s, c, Q, P, p, n }: WebsocketTicker) {
    this.updateTicker({
      symbol: s,
      lastPrice: c,
      lastQty: Q,
      priceChange: p,
      priceChangePercent: P,
      count: n,
    });
  }

  loadData() {
    this.store$.dispatch(tickerActions.load());
  }

  updateTicker(ticker: TickerEntity) {
    this.store$.dispatch(tickerActions.update({ data: ticker }));
  }
}
