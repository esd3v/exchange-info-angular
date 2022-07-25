import { actions, AppState } from 'src/app/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { ExchangeInfoService } from 'src/app/services/exchange-info.service';

@Injectable()
export class ExchangeInfoEffects {
  constructor(
    private actions$: Actions,
    private exchangeInfoService: ExchangeInfoService
  ) {}

  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.exchangeInfo.load),
      switchMap(() => {
        return this.exchangeInfoService
          .get()
          .pipe(map((data) => actions.exchangeInfo.loadSuccess(data)));
      })
    );
  });
}
