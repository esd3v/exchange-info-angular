import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { ExchangeInfoService } from 'src/app/services/exchange-info.service';
import { exchangeInfoActions } from '.';

@Injectable()
export class ExchangeInfoEffects {
  constructor(
    private actions$: Actions,
    private exchangeInfoService: ExchangeInfoService
  ) {}

  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(exchangeInfoActions.load),
      switchMap(() => {
        return this.exchangeInfoService
          .get()
          .pipe(map((data) => exchangeInfoActions.loadSuccess(data)));
      })
    );
  });
}
