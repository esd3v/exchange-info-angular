import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { GlobalService } from 'src/app/features/global/services/global.service';
import { AppState } from 'src/app/store';

@Component({
  selector: 'app-ticker-pair',
  templateUrl: './ticker-pair.component.html',
})
export class TickerPairComponent {
  public loading = true;

  public globalPair$ = this.globalService.globalPair$.pipe(
    tap((data) => {
      this.loading = !Boolean(data);
    })
  );

  public constructor(
    private store$: Store<AppState>,
    private globalService: GlobalService
  ) {}
}
