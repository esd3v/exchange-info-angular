import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { candlesActions } from '.';
import { CandlesRestService } from '../services/candles-rest.service';

@Injectable()
export class CandlesEffects {
  loadCandles$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(candlesActions.load),
      switchMap(({ interval, symbol }) => {
        return this.candlesRestService
          .get$({ interval, symbol })
          .pipe(
            map((data) =>
              candlesActions.loadSuccess({ candles: data, interval })
            )
          );
      })
    );
  });

  constructor(
    private actions$: Actions,
    private candlesRestService: CandlesRestService
  ) {}
}
