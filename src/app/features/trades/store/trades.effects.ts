import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tradesActions } from '.';
import { TradesService } from '../services/trades.service';

@Injectable()
export class TradesEffects {
  public loadTrades$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tradesActions.load),
      switchMap(({ params }) => {
        return this.tradesService
          .get(params)
          .pipe(map((data) => tradesActions.loadSuccess({ trades: data })));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private tradesService: TradesService
  ) {}
}
