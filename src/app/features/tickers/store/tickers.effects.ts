import { TickerRestService } from '../services/ticker-rest.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tickersActions } from '.';

@Injectable()
export class TickersEffects {
  public loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tickersActions.load),
      switchMap(() => {
        return this.tickerRestService
          .get$()
          .pipe(map((data) => tickersActions.loadSuccess({ data })));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private tickerRestService: TickerRestService
  ) {}
}
