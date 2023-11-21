import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TableStyleService {
  tableClass = 'table';

  rowClass = `${this.tableClass}__row`;

  headerRowClass = `${this.tableClass}__headerRow`;

  headerCellClass = `${this.tableClass}__headerCell`;

  rowHighlightClass = `${this.rowClass}--highlight`;

  cellClass = `${this.tableClass}__cell`;

  cellPositiveClass = `${this.cellClass}--positive`;

  cellNegativeClass = `${this.cellClass}--negative`;

  cellRightClass = `${this.cellClass}--alignedRight`;

  constructor() {}
}
