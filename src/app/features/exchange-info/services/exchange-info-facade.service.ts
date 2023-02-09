import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { exchangeInfoActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoFacade {
  public constructor(private store$: Store<AppState>) {}

  public loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
