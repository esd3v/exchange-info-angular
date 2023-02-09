import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { isPositive } from '../../../../shared/helpers';
import { TickerFacade } from '../../services/ticker-facade.service';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent {
  public loading$ = this.tickerFacade.isLoading$;

  public priceChange$ = this.tickerFacade.priceChange$.pipe(filter(Boolean));

  public positive$ = this.priceChange$.pipe(map(isPositive));

  public constructor(private tickerFacade: TickerFacade) {}
}
