import { Component, OnInit } from '@angular/core';
import { combineLatest, filter, first, map, switchMap } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { formatPrice, formatPriceChangePercent } from 'src/app/shared/helpers';
import { TickerFacade } from '../../services/ticker-facade.service';
import { WebsocketService } from 'src/app/websocket/services/websocket.service';
import { TickerWebsocketService } from '../../services/ticker-websocket.service';
import { TickerRestService } from '../../services/ticker-rest.service';

@Component({
  selector: 'app-ticker-group',
  templateUrl: './ticker-group.component.html',
})
export class TickerGroupComponent implements OnInit {
  pair!: string;

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
    private globalFacade: GlobalFacade,
    private tickerFacade: TickerFacade,
    private tickerRestService: TickerRestService,
    private websocketService: WebsocketService,
    private tickerWebsocketService: TickerWebsocketService
  ) {}

  private isPositive(value: string | number): boolean {
    return Number(value) > 0;
  }

  ngOnInit(): void {
    // On websocket start
    this.websocketService.status$
      .pipe(
        filter((status) => status === 'open'),
        switchMap(() => this.globalFacade.symbol$.pipe(first()))
      )
      .subscribe((symbol) => {
        this.tickerWebsocketService.singleSubscriber.subscribe({
          symbols: [symbol],
        });
      });

    // Loading with tickSize
    combineLatest([
      this.tickerRestService.status$.pipe(
        filter((status) => status === 'loading')
      ),
      this.tickerFacade.tickSize$.pipe(
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
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
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

    // Pair
    this.globalFacade.pair$.subscribe((pair) => {
      this.pair = pair;
    });

    // Last price
    combineLatest([
      this.tickerFacade.lastPrice$.pipe(filter(Boolean)),
      // don't initially check for boolean because prevLastPrice comes after ws update later
      this.tickerFacade.prevLastPrice$,
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
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
      this.tickerFacade.priceChange$.pipe(filter(Boolean)),
      this.tickerFacade.tickSize$.pipe(filter(Boolean)),
    ]).subscribe(([priceChange, tickSize]) => {
      this.priceChange = formatPrice(priceChange, tickSize);
      this.priceChangePositive = this.isPositive(priceChange);
    });

    // Price change percent
    this.tickerFacade.priceChangePercent$
      .pipe(filter(Boolean))
      .subscribe((priceChangePercent) => {
        this.priceChangePercent = formatPriceChangePercent(priceChangePercent);
        this.priceChangePercentPositive = this.isPositive(priceChangePercent);
      });

    // Number of trades
    this.tickerFacade.numberOfTrades$
      .pipe(filter(Boolean), map(Number))
      .subscribe((numberOfTrades) => {
        this.numberOfTrades = numberOfTrades;
      });

    // Last quantity
    this.tickerFacade.lastQuantity$
      .pipe(filter(Boolean), map(Number))
      .subscribe((lastQuantity) => {
        this.lastQuantity = lastQuantity;
      });
  }
}
