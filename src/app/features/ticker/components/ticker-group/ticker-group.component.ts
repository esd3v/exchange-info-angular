import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, map } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { formatPrice, formatPriceChangePercent } from 'src/app/shared/helpers';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TickerRestService } from '../../services/ticker-rest.service';
import { TickerService } from '../../services/ticker.service';

@Component({
  selector: 'app-ticker-group',
  templateUrl: './ticker-group.component.html',
})
export class TickerGroupComponent implements OnInit {
  get #globalSymbol() {
    return this.globalService.symbol;
  }

  get globalPair() {
    return this.globalService.pair;
  }

  pairLoading: boolean = false;

  lastPrice!: string;

  lastPriceLoading: boolean = false;

  lastPricePositive!: boolean;

  priceChange!: string;

  priceChangeLoading: boolean = false;

  priceChangePositive!: boolean;

  priceChangePercent!: string;

  priceChangePercentLoading: boolean = false;

  priceChangePercentPositive!: boolean;

  numberOfTrades!: number;

  numberOfTradesLoading: boolean = false;

  lastQuantity!: number;

  lastQuantityLoading: boolean = false;

  constructor(
    private globalService: GlobalService,
    private tickerService: TickerService,
    private tickerRestService: TickerRestService,
    private websocketService: WebsocketService
  ) {}

  private isPositive(value: string | number): boolean {
    return Number(value) > 0;
  }

  ngOnInit(): void {
    // On websocket start
    this.websocketService.status$
      .pipe(filter((status) => status === 'open'))
      .subscribe(() => {
        this.tickerService.singleSubscriber.subscribeToStream({
          symbols: [this.#globalSymbol],
        });
      });

    // Loading with tickSize
    combineLatest([
      this.tickerRestService.status$.pipe(
        filter((status) => status === 'loading')
      ),
      this.tickerService.globalTickerTickSize$.pipe(
        filter((tickSize) => !Boolean(tickSize))
      ),
    ]).subscribe(() => {
      this.lastPriceLoading = true;
      this.priceChangeLoading = true;
    });

    // Loading with tickSize complete
    combineLatest([
      this.tickerRestService.status$.pipe(
        filter((status) => status === 'success')
      ),
      this.tickerService.globalTickerTickSize$.pipe(filter(Boolean)),
    ]).subscribe(() => {
      this.lastPriceLoading = false;
      this.priceChangeLoading = false;
    });

    // Loading without tickSize
    this.tickerRestService.status$
      .pipe(filter((status) => status === 'loading'))
      .subscribe(() => {
        this.priceChangePercentLoading = true;
        this.lastQuantityLoading = true;
        this.numberOfTradesLoading = true;
      });

    // Loading without tickSize complete
    this.tickerRestService.status$
      .pipe(filter((status) => status === 'success'))
      .subscribe(() => {
        this.priceChangePercentLoading = false;
        this.lastQuantityLoading = false;
        this.numberOfTradesLoading = false;
      });

    // Last price
    combineLatest([
      this.tickerService.globalTickerLastPrice$.pipe(filter(Boolean)),
      // don't initially check for boolean because prevLastPrice comes after ws update later
      this.tickerService.globalTickerPrevLastPrice$,
      this.tickerService.globalTickerTickSize$.pipe(filter(Boolean)),
    ]).subscribe(([lastPrice, prevLastPrice, tickSize]) => {
      this.lastPrice = formatPrice(lastPrice, tickSize);

      if (Number(lastPrice) > Number(prevLastPrice)) {
        this.lastPricePositive = true;
      } else if (Number(lastPrice) < Number(prevLastPrice)) {
        this.lastPricePositive = false;
      }
    });

    // Price change
    combineLatest([
      this.tickerService.globalTickerPriceChange$.pipe(filter(Boolean)),
      this.tickerService.globalTickerTickSize$.pipe(filter(Boolean)),
    ]).subscribe(([priceChange, tickSize]) => {
      this.priceChange = formatPrice(priceChange, tickSize);
      this.priceChangePositive = this.isPositive(priceChange);
    });

    // Price change percent
    this.tickerService.globalTickerPriceChangePercent$
      .pipe(filter(Boolean))
      .subscribe((priceChangePercent) => {
        this.priceChangePercent = formatPriceChangePercent(priceChangePercent);
        this.priceChangePercentPositive = this.isPositive(priceChangePercent);
      });

    // Number of trades
    this.tickerService.globalTickerNumberOfTrades$
      .pipe(filter(Boolean), map(Number))
      .subscribe((numberOfTrades) => {
        this.numberOfTrades = numberOfTrades;
      });

    // Last quantity
    this.tickerService.globalTickerLastQuantity$
      .pipe(filter(Boolean), map(Number))
      .subscribe((lastQuantity) => {
        this.lastQuantity = lastQuantity;
      });
  }
}
