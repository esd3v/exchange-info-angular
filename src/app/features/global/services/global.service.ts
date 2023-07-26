import { Injectable } from '@angular/core';
import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';
import { Currency } from '../types/currency';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  constructor() {}

  currency: Currency = {
    base: APP_DEFAULT_BASE_CURRENCY,
    quote: APP_DEFAULT_QUOTE_CURRENCY,
  };

  notification = {
    type: 'info',
    message: '',
  };

  get pair() {
    const { base, quote } = this.currency;

    return `${base}/${quote}`;
  }

  get symbol() {
    return this.pair.replace('/', '');
  }

  get pairUnderscore() {
    return this.pair.replace('/', '_');
  }

  setCurrency(currency: Currency) {
    this.currency = currency;
  }
}
