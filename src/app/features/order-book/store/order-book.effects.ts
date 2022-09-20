import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs';
import { orderBookActions } from '.';
import { OrderBookService } from '../services/order-book.service';

@Injectable()
export class OrderBookEffects {
  public loadOrderBook$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(orderBookActions.load),
      switchMap(({ params }) => {
        return this.orderBookService
          .get(params)
          .pipe(map((data) => orderBookActions.loadSuccess(data)));
      })
    );
  });

  public constructor(
    private actions$: Actions,
    private orderBookService: OrderBookService
  ) {}
}
