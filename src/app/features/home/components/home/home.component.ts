import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { timer } from 'rxjs';
import { REST_START_DELAY } from 'src/app/shared/config';
import { parsePair } from 'src/app/shared/helpers';
import { AppState } from 'src/app/store';
import { globalActions } from 'src/app/store/global';
import { HomerService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private homeService: HomerService
  ) {}

  private getParsedRoutePair() {
    const routePair = this.route.snapshot.paramMap.get('pair');

    if (routePair !== null) {
      const { base, quote } = parsePair(routePair, '_');

      if (base && quote) {
        return { base, quote };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  public ngOnInit() {
    const parsedRoutePair = this.getParsedRoutePair();

    if (parsedRoutePair) {
      const { base, quote } = parsedRoutePair;
      const symbol = `${base}${quote}`;

      timer(REST_START_DELAY).subscribe(() => {
        this.homeService.handleExchangeInfoOnAppInit();
        this.homeService.handleTickerOnAppInit(symbol);
        this.homeService.handleCandlesOnAppInit({ symbol });
        this.homeService.handleOrderBookOnAppInit({ symbol });
        this.homeService.handleTradesOnAppInit({ symbol });
      });

      this.store.dispatch(
        globalActions.setCurrency({ payload: { base, quote } })
      );
    }
  }
}
