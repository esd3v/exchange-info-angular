import { Component, OnInit } from '@angular/core';
import { combineLatestWith, filter } from 'rxjs';
import { TickerFacade } from '../../services/ticker-facade.service';

@Component({
  selector: 'app-ticker-last-price',
  templateUrl: './ticker-last-price.component.html',
})
export class TickerLastPriceComponent implements OnInit {
  public positive: boolean | null = null;
  public loading$ = this.tickerFacade.isLoading$;

  public lastPrice$ = this.tickerFacade.lastPrice$.pipe(filter(Boolean));

  public prevLastPrice$ = this.tickerFacade.prevLastPrice$.pipe(
    filter(Boolean)
  );

  public constructor(private tickerFacade: TickerFacade) {}

  public ngOnInit(): void {
    this.lastPrice$
      .pipe(combineLatestWith(this.prevLastPrice$))
      .subscribe(([lastPrice, prevLastPrice]) => {
        if (lastPrice && prevLastPrice) {
          if (Number(lastPrice) > Number(prevLastPrice)) {
            this.positive = true;
          } else if (Number(lastPrice) < Number(prevLastPrice)) {
            this.positive = false;
          }
        }
      });
  }
}
