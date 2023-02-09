import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { isPositive } from '../../../../shared/helpers';
import { TickerFacade } from '../../services/ticker-facade.service';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  public loading$ = this.tickerFacade.isLoading$;

  public priceChangePercent$ = this.tickerFacade.priceChangePercent$.pipe(
    filter(Boolean)
  );

  public positive$ = this.priceChangePercent$.pipe(map(isPositive));

  public constructor(private tickerFacade: TickerFacade) {}
}
