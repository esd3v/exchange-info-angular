import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { candlesActions } from '.';
import { CandlesService } from '../services/candles.service';

@Injectable()
export class CandlesEffects {
  public loadExchangeInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(candlesActions.load),
      switchMap(({ params }) => {
        return this.candlesService
          .get(params)
          .pipe(map((data) => candlesActions.loadSuccess({ candles: data })));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private candlesService: CandlesService
  ) {}
}
