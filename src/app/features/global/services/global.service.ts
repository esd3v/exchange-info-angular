import { Injectable } from '@angular/core';
import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';
import { Currency } from '../types/currency';
import { BehaviorSubject, map } from 'rxjs';
import { createPair } from 'src/app/shared/helpers';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  currency$ = new BehaviorSubject<Currency>({
    base: APP_DEFAULT_BASE_CURRENCY,
    quote: APP_DEFAULT_QUOTE_CURRENCY,
  });

  pair$ = this.currency$.pipe(map(createPair));

  constructor() {}

  setCurrency(currency: Currency) {
    this.currency$.next(currency);
  }
}
