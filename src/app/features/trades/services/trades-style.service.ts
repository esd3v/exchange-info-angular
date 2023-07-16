import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TradesStyleService {
  public tableClass = 'trades';
  public rowClass = `${this.tableClass}__row`;
  public cellClass = `${this.tableClass}__cell`;
  public cellPositiveClass = `${this.cellClass}--positive`;
  public cellNegativeClass = `${this.cellClass}--negative`;
  public cellRightClass = `${this.cellClass}--alignedRight`;

  public constructor() {}
}
