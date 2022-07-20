import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs';
import { AppState, selectors } from 'src/app/store';

@Component({
  selector: 'app-ticker-pair',
  templateUrl: './ticker-pair.component.html',
})
export class TickerPairComponent {
  constructor(private store: Store<AppState>) {}

  loading = true;
  globalPair = this.store.select(selectors.global.globalPair).pipe(
    tap((data) => {
      this.loading = !Boolean(data);
    })
  );
}
