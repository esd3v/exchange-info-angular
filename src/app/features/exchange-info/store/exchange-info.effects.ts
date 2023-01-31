import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { ExchangeInfoRestService } from 'src/app/features/exchange-info/services/exchange-info-rest.service';
import { exchangeInfoActions } from '.';
import { symbolsActions } from 'src/app/store/symbols';

@Injectable()
export class ExchangeInfoEffects {
  public loadExchangeInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(exchangeInfoActions.load),
      switchMap(() => {
        return this.exchangeInfoRestService
          .get$()
          .pipe(map((data) => exchangeInfoActions.loadSuccess(data)));
      })
    );
  });

  public createSymbols$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(exchangeInfoActions.loadSuccess),
      map((data) => {
        return symbolsActions.create(data);
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private exchangeInfoRestService: ExchangeInfoRestService
  ) {}
}
