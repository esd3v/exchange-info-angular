import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { globalActions, globalSelectors } from 'src/app/features/global/store';
import { AppState } from 'src/app/store';

@Injectable({
  providedIn: 'root',
})
export class GlobalFacade {
  currency$ = this.store$.select(globalSelectors.currency);

  symbol$ = this.store$.select(globalSelectors.globalSymbol);

  pair$ = this.store$.select(globalSelectors.globalPair);

  pairUnderscore$ = this.store$.select(globalSelectors.globalPairUnderscore);

  constructor(private store$: Store<AppState>) {}

  setCurrency({
    base,
    quote,
  }: Parameters<typeof globalActions.setCurrency>[0]) {
    this.store$.dispatch(globalActions.setCurrency({ base, quote }));
  }
}
