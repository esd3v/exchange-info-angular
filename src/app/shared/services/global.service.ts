import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { first, filter } from 'rxjs';
import { AppState } from 'src/app/store';
import { globalSelectors } from 'src/app/store/global';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public currency$ = this.store$.select(globalSelectors.currency);
  public globalSymbol$ = this.store$.select(globalSelectors.globalSymbol);
  public globalPair$ = this.store$.select(globalSelectors.globalPair);

  public globalPairUnderscore$ = this.store$.select(
    globalSelectors.globalPairUnderscore
  );

  public globalPairCurrent$ = this.globalPair$.pipe(first(), filter(Boolean));

  public globalSymbolCurrent$ = this.globalSymbol$.pipe(
    first(),
    filter(Boolean)
  );

  public globalPairUnderscoreCurrent$ = this.globalPairUnderscore$.pipe(
    first(),
    filter(Boolean)
  );

  public constructor(private store$: Store<AppState>) {}
}
