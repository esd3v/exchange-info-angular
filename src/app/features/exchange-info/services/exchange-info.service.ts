import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { exchangeInfoActions, exchangeInfoSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoService {
  tradingSymbols$ = this.store$.select(exchangeInfoSelectors.tradingSymbols);

  constructor(private store$: Store<AppState>) {}

  loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
