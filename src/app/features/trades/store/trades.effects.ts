import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tradesActions } from '.';
import { TradesRestService } from '../services/trades-rest.service';

@Injectable()
export class TradesEffects {
  public loadTrades$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tradesActions.load),
      switchMap(({ symbol, limit }) => {
        return this.tradesRestService
          .get({ symbol, limit })
          .pipe(map((data) => tradesActions.loadSuccess({ trades: data })));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private tradesRestService: TradesRestService
  ) {}
}
