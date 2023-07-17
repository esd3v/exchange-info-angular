import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { symbolsSelectors } from '../../symbols/store';
import { exchangeInfoActions, exchangeInfoSelectors } from '../store';

@Injectable({
  providedIn: 'root',
})
export class ExchangeInfoFacade {
  public restStatus$ = this.store$.select(exchangeInfoSelectors.status);

  // TODO Move?
  public tradingSymbols$ = this.store$.select(symbolsSelectors.tradingSymbols);

  public constructor(private store$: Store<AppState>) {}

  public loadData() {
    this.store$.dispatch(exchangeInfoActions.load());
  }
}
