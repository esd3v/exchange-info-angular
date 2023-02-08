import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { TickerFacade } from '../../services/ticker-facade.service';

@Component({
  selector: 'app-ticker-trades',
  templateUrl: './ticker-trades.component.html',
})
export class TickerTradesComponent {
  public loading$ = this.tickerFacade.isLoading$;

  public numberOfTrades$ = this.tickerFacade.numberOfTrades$
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );

  public constructor(private tickerFacade: TickerFacade) {}
}
