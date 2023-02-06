import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { isPositive } from '../../../../shared/helpers';
import { TickerService } from '../../services/ticker.service';

@Component({
  selector: 'app-ticker-change',
  templateUrl: './ticker-change.component.html',
})
export class TickerChangeComponent {
  public loading$ = this.tickerService.isLoading$;

  public priceChange$ = this.tickerService.priceChange$.pipe(filter(Boolean));

  public positive$ = this.priceChange$.pipe(map(isPositive));

  public constructor(private tickerService: TickerService) {}
}
