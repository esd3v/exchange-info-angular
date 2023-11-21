import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { tradesActions } from '.';
import { TradesRestService } from '../services/trades-rest.service';

@Injectable()
export class TradesEffects {
  loadTrades$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tradesActions.load),
      switchMap(({ symbol, limit }) => {
        return this.tradesRestService
          .get$({ symbol, limit })
          .pipe(map((data) => tradesActions.loadSuccess({ trades: data })));
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private tradesRestService: TradesRestService,
  ) {}
}
