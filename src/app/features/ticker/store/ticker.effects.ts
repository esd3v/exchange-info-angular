import { TickerRestService } from '../services/ticker-rest.service';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { tickerActions } from '.';

@Injectable()
export class TickerEffects {
  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(tickerActions.load),
      switchMap(() => {
        return this.tickerRestService
          .get$()
          .pipe(map((data) => tickerActions.loadSuccess({ data })));
      }),
    );
  });

  constructor(
    private actions$: Actions,
    private tickerRestService: TickerRestService,
  ) {}
}
