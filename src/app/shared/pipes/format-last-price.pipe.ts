import { Pipe, PipeTransform } from '@angular/core';
import { formatLastPrice } from '../helpers';

@Pipe({
  name: 'formatLastPrice',
})
export class FormatLastPricePipe implements PipeTransform {
  transform(value: string | null) {
    return value ? formatLastPrice(value) : value;
  }
}
