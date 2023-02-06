import { Component, OnInit } from '@angular/core';
import { combineLatestWith, filter } from 'rxjs';
import { TickerService } from '../../services/ticker.service';

@Component({
  selector: 'app-ticker-last-price',
  templateUrl: './ticker-last-price.component.html',
})
export class TickerLastPriceComponent implements OnInit {
  public positive: boolean | null = null;
  public loading$ = this.tickerService.isLoading$;

  public lastPrice$ = this.tickerService.lastPrice$.pipe(filter(Boolean));

  public prevLastPrice$ = this.tickerService.prevLastPrice$.pipe(
    filter(Boolean)
  );

  public constructor(private tickerService: TickerService) {}

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
