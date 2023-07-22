import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { globalActions, globalSelectors } from 'src/app/features/global/store';
import { AppState } from 'src/app/store';

@Injectable({
  providedIn: 'root',
})
export class GlobalFacade {
  public currency$ = this.store$.select(globalSelectors.currency);
  public symbol$ = this.store$.select(globalSelectors.globalSymbol);
  public pair$ = this.store$.select(globalSelectors.globalPair);

  public pairUnderscore$ = this.store$.select(
    globalSelectors.globalPairUnderscore
  );

  public constructor(private store$: Store<AppState>) {}

  public setCurrency({
    base,
    quote,
  }: Parameters<typeof globalActions.setCurrency>[0]) {
    this.store$.dispatch(globalActions.setCurrency({ base, quote }));
  }
}
