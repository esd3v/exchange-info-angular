import { Pipe, PipeTransform } from '@angular/core';
import { formatPriceChangePercent } from '../helpers';

@Pipe({
  name: 'formatPriceChangePercent',
})
export class FormatPriceChangePercentPipe implements PipeTransform {
  transform(value: string | null) {
    return value ? formatPriceChangePercent(value) : value;
  }
}
