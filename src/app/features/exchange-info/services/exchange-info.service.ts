import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { symbolsSelectors } from '../../symbols/store';
import { exchangeInfoActions } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoService {
  // TODO Move?
  tradingSymbols$ = this.store$.select(symbolsSelectors.tradingSymbols);

  constructor(private store$: Store<AppState>) {}

  loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
