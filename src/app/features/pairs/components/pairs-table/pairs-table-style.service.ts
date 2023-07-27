import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PairsTableStyleService {
  tableClass = 'pairs';

  rowClass = `${this.tableClass}__row`;
}
