import { TickerService } from './../../services/ticker.service';
import { actions } from 'src/app/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';

@Injectable()
export class TickerEffects {
  constructor(
    private actions$: Actions,
    private tickerService: TickerService
  ) {}

  loadTicker$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(actions.ticker.load),
      switchMap(() => {
        return this.tickerService
          .get()
          .pipe(map((data) => actions.ticker.loadSuccess({ data })));
      })
    );
  });
}
