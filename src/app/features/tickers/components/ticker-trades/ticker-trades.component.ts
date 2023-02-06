import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { TickerService } from '../../services/ticker.service';

@Component({
  selector: 'app-ticker-trades',
  templateUrl: './ticker-trades.component.html',
})
export class TickerTradesComponent {
  public loading$ = this.tickerService.isLoading$;

  public numberOfTrades$ = this.tickerService.numberOfTrades$
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );

  public constructor(private tickerService: TickerService) {}
}
