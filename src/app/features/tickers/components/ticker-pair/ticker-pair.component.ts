import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { GlobalFacade } from 'src/app/features/global/services/global-facade.service';
import { AppState } from 'src/app/store';

@Component({
  selector: 'app-ticker-pair',
  templateUrl: './ticker-pair.component.html',
})
export class TickerPairComponent {
  public loading = true;

  public globalPair$ = this.globalFacade.globalPair$.pipe(
    tap((data) => {
      this.loading = !Boolean(data);
    })
  );

  public constructor(
    private store$: Store<AppState>,
    private globalFacade: GlobalFacade
  ) {}
}
