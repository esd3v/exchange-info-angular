import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { orderBookActions } from '.';
import { OrderBookRestService } from '../services/order-book-rest.service';

@Injectable()
export class OrderBookEffects {
  public loadOrderBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(orderBookActions.load),
      switchMap(({ symbol, limit }) => {
        return this.orderBookRestService
          .get({ symbol, limit })
          .pipe(map((data) => orderBookActions.loadSuccess(data)));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private orderBookRestService: OrderBookRestService
  ) {}
}
