import { TickerService } from '../services/ticker.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tickersActions } from '.';

@Injectable()
export class TickersEffects {
  constructor(
    private actions$: Actions,
    private tickerService: TickerService
  ) {}

  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tickersActions.load),
      switchMap(() => {
        return this.tickerService
          .get()
          .pipe(map((data) => tickersActions.loadSuccess({ data })));
      })
    );
  });
}
