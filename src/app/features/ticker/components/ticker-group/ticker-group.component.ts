import { Component, OnInit } from '@angular/core';
import { filter, first, map, switchMap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { formatPrice, formatPriceChangePercent } from 'src/app/shared/helpers';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TickerService } from '../../services/ticker.service';
import { GlobalTicker } from '../../types/global-ticker';

@Component({
  selector: 'app-ticker-group',
  templateUrl: './ticker-group.component.html',
})
export class TickerGroupComponent implements OnInit {
  globalPair$ = this.globalService.pair$;

  ticker!: GlobalTicker;

  get loading() {
    return !Boolean(this.ticker);
  }

  get lastPrice() {
    return this.ticker
      ? formatPrice(this.ticker.lastPrice, this.ticker.tickSize)
      : '';
  }

  get priceChange() {
    return this.ticker
      ? formatPrice(this.ticker.priceChange, this.ticker.tickSize)
      : '';
  }

  get priceChangePercent() {
    return this.ticker
      ? formatPriceChangePercent(this.ticker.priceChangePercent)
      : '';
  }

  get numberOfTrades() {
    return this.ticker ? Number(this.ticker.numberOfTrades) : '';
  }

  get lastQuantity() {
    return this.ticker ? Number(this.ticker.lastQuantity) : '';
  }

  get lastPricePositive() {
    return this.ticker
      ? this.ticker.lastPrice > this.ticker.prevLastPrice
      : null;
  }

  get priceChangePositive() {
    return this.ticker ? this.isPositive(this.ticker.priceChange) : null;
  }

  get priceChangePercentPositive() {
    return this.ticker ? this.isPositive(this.ticker.priceChangePercent) : null;
  }

  constructor(
    private globalService: GlobalService,
    private tickerService: TickerService,
    private websocketService: WebsocketService
  ) {}

  isPositive(value: string | number): boolean {
    return Number(value) > 0;
  }

  onWebsocketOpen() {
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() => this.globalPair$.pipe(first()))
      )
      .subscribe((globalPair) => {
        this.tickerService.singleSubscriber.subscribeToStream({
          symbols: [globalPair.symbol],
        });
      });
  }

  onGlobalTickerUpdate() {
    this.tickerService.globalTicker$
      .pipe(filter(Boolean))
      .subscribe((ticker) => {
        this.ticker = ticker;
      });
  }

  ngOnInit(): void {
    this.onWebsocketOpen();

    this.onGlobalTickerUpdate();
  }
}
