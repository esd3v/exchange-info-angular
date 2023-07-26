import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { TickerService } from 'src/app/features/ticker/services/ticker.service';
import {
  APP_SITE_NAME,
  WEBSOCKET_ENABLED_AT_START,
} from 'src/app/shared/config';
import { convertPairToCurrency, formatPrice } from 'src/app/shared/helpers';
import { HomeService } from './home.service';
import { ExchangeInfoService } from 'src/app/features/exchange-info/services/exchange-info.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    // ActivatedRoute shouldn't be in a service because it doesn't work in services
    // https://github.com/angular/angular/issues/12884#issuecomment-260575298
    private route: ActivatedRoute,
    private homeService: HomeService,
    private titleService: Title,
    private globalService: GlobalService,
    private exchangeInfoService: ExchangeInfoService,
    private tickerService: TickerService
  ) {
    this.#onRouteEvent();
  }

  #getParsedRoutePair() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair === null) {
      return null;
    }

    const { base, quote } = convertPairToCurrency(routePair, '_');

    // e.g "ETH_" or "_BTC"
    if (!base || !quote) {
      return null;
    }

    return { base, quote };
  }

  #handleNavigationEnd() {
    const parsedRoutePair = this.#getParsedRoutePair();

    if (!parsedRoutePair) {
      return this.homeService.navigateToDefaultPair();
    }

    const { base, quote } = parsedRoutePair;

    this.globalService.setCurrency({ base, quote });
    this.exchangeInfoService.loadData();
    this.tickerService.loadData();
  }

  #createTitle({
    lastPrice,
    pair,
    tickSize,
  }: {
    lastPrice: string | undefined;
    tickSize: string | undefined;
    pair: string;
  }) {
    const delimiter = ' | ';

    const pricePart =
      lastPrice && tickSize
        ? `${formatPrice(lastPrice, tickSize)}${delimiter}`
        : '';

    const globalPairPart = pair ? `${pair}${delimiter}` : '';

    return `${pricePart}${globalPairPart}${APP_SITE_NAME}`;
  }

  #updateTitle() {
    combineLatest([
      this.tickerService.globalTickerLastPrice$,
      this.tickerService.globalTickerTickSize$,
    ]).subscribe(([lastPrice, tickSize]) => {
      const title = this.#createTitle({
        pair: this.globalService.pair,
        lastPrice,
        tickSize,
      });

      this.titleService.setTitle(title);
    });
  }

  #onRouteEvent() {
    const routeEvents$ = this.router.events;

    routeEvents$.subscribe((data: unknown) => {
      const { type } = data as Event;

      // If navigation ended
      if (Number(type) === 1) {
        this.#handleNavigationEnd();
      }
    });
  }

  ngOnInit(): void {
    if (WEBSOCKET_ENABLED_AT_START) {
      this.homeService.startWebSocket();
    }

    this.#updateTitle();

    this.homeService.onWebsocketMessage();
    this.homeService.onWebsocketStatus();
  }
}
