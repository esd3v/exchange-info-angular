import { Pipe, PipeTransform } from '@angular/core';
import { formatPrice } from '../helpers';

@Pipe({
  name: 'formatPrice',
})
export class FormatPricePipe implements PipeTransform {
  transform(value: string | null, tickSize: string | null) {
    return value === null || tickSize === null
      ? null
      : value
      ? formatPrice(value, tickSize)
      : value;
  }
}
