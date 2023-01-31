import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';

@Component({
  selector: 'app-ticker-pair',
  templateUrl: './ticker-pair.component.html',
})
export class TickerPairComponent {
  public loading = true;
  public globalPair$ = this.store$.select(globalSelectors.globalPair).pipe(
    tap((data) => {
      this.loading = !Boolean(data);
    })
  );

  public constructor(private store$: Store<AppState>) {}
}
