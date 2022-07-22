import { formatLastPrice } from 'src/app/helpers';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatLastPrice',
})
export class FormatLastPricePipe implements PipeTransform {
  transform(value: string | null) {
    return value ? formatLastPrice(value) : value;
  }
}
