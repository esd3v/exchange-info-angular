import { Component } from '@angular/core';
import { filter, map } from 'rxjs';
import { isPositive } from '../../../../shared/helpers';
import { TickerService } from '../../services/ticker.service';

@Component({
  selector: 'app-ticker-change-percent',
  templateUrl: './ticker-change-percent.component.html',
})
export class TickerChangePercentComponent {
  public loading$ = this.tickerService.isLoading$;

  public priceChangePercent$ = this.tickerService.priceChangePercent$.pipe(
    filter(Boolean)
  );

  public positive$ = this.priceChangePercent$.pipe(map(isPositive));

  public constructor(private tickerService: TickerService) {}
}
