import { Pipe, PipeTransform } from '@angular/core';
import { formatDecimal } from '../helpers';

@Pipe({
  name: 'formatDecimal',
})
export class FormatDecimalPipe implements PipeTransform {
  public transform(value: string | null) {
    return value ? formatDecimal(value) : value;
  }
}
