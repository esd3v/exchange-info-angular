import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first, map } from 'rxjs';
import { AppState } from 'src/app/store';
import { exchangeInfoActions, exchangeInfoSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoFacade {
  public status$ = this.store$.select(exchangeInfoSelectors.status);

  public successCurrent$ = this.status$.pipe(
    first(),
    filter((status) => status === 'success')
  );

  public successUntil$ = this.status$.pipe(
    filter((status) => status === 'success'),
    first()
  );

  public isLoading$ = this.status$.pipe(
    map((status) => (status === 'init' ? null : status === 'loading'))
  );

  public constructor(private store$: Store<AppState>) {}

  public loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
