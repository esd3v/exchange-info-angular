import { TickerService } from '../services/ticker.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tickerActions } from '.';

@Injectable()
export class TickerEffects {
  constructor(
    private actions$: Actions,
    private tickerService: TickerService
  ) {}

  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tickerActions.load),
      switchMap(() => {
        return this.tickerService
          .get()
          .pipe(map((data) => tickerActions.loadSuccess({ data })));
      })
    );
  });
}
