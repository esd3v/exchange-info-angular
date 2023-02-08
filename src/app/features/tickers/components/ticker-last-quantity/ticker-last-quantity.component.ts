import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { TickerFacade } from '../../services/ticker-facade.service';

@Component({
  selector: 'app-ticker-last-quantity',
  templateUrl: './ticker-last-quantity.component.html',
})
export class TickerLastQuantityComponent {
  public loading$ = this.tickerFacade.isLoading$;
  public lastQuantity$ = this.tickerFacade.lastQuantity$
    // Don't use just map(Number) because we need also null result for N/A
    .pipe(
      filter(Boolean),
      map((data) => data && Number(data))
    );

  public constructor(private tickerFacade: TickerFacade) {}
}
