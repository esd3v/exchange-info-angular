import { MISC_TOFIXED_DIGITS } from './config';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { SortOrder } from './models/sort-order.model';
import { Row } from './models/row.model';
import { Decimal } from 'decimal.js';
import { Column } from './models/column';

dayjs.extend(utc);

export const addPlusIfPositive = (value: string): string =>
  `${Number(value) > 0 ? `+${value}` : value}`;

export const isScientific = (value: string | number) =>
  /\d+\.?\d*e[+-]*\d+/i.test(
    typeof value === 'number' ? value.toString() : value
  );

export const parsePair = (pair: string, separator: '/' | '_') => {
  const [base, quote] = pair.split(separator);

  return {
    base: base || null,
    quote: quote || null,
  };
};

export const formatDecimal = (value: number | string) => {
  const number = new Decimal(value);
  const formatted = number.valueOf();

  // If value is too small (e.g 0.00000041 and it formatted to 4.1e-7)...
  // ...don't format it, just return the original string
  return isScientific(formatted) ? value : formatted;
};

export const multiplyDecimal = (a: number | string, b: number | string) => {
  const da = new Decimal(a);
  const db = new Decimal(b);

  return da.times(db).valueOf();
};

export function numberWithCommas(x: string, symbol = ',') {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol);
}

export const formatPriceChangePercent = (value: string) =>
  `${addPlusIfPositive(Number(value).toFixed(MISC_TOFIXED_DIGITS))}%`;

export const isPositive = (value: string | null) =>
  value === null || Number(value) === 0 ? null : Number(value) > 0;

export const getFormattedDate = ({
  msec,
  utc,
  format = 'DD-MM-YYYY HH:mm',
}: {
  msec: number;
  format?: string;
  utc?: boolean;
}) => (utc ? dayjs.utc(msec).format(format) : dayjs(msec).format(format));

export function getSortOrder<T extends number | string>(a: T, b: T) {
  const result1 = (b as number) - (a as number);
  const result2 = (a as number) - (b as number);

  if (Number.isFinite(result1)) {
    return result1;
  } else if (b < a) {
    return -1;
  }

  if (Number.isFinite(result2)) {
    return result2;
  } else if (b > a) {
    return 1;
  }

  return 0;
}

export function sortRows<T extends Row[]>({
  headCellIndex,
  order,
  rows,
}: {
  rows: T;
  order: SortOrder;
  headCellIndex: number;
}) {
  type Column = [any, number][];

  // Make an array where 0 is cell of a column and 1 is cell's row index
  const getColumn = (rows: T, headCellIndex: number): Column => {
    return rows.map((cells, rowIndex) => {
      const cell = cells[headCellIndex];

      return [cell['value'], rowIndex];
    });
  };

  const applyColumn = (rows: T, column: Column, headCellIndex: number) =>
    rows.map((row, rowIndex) =>
      row.map((_cell, cellIndex) => {
        const originalRow = column[rowIndex][1];
        const originalCell = rows[originalRow][cellIndex];

        const cellToReplace = {
          ...originalCell,
          value: column[rowIndex][0],
        };

        return cellIndex === headCellIndex ? cellToReplace : originalCell;
      })
    );

  const column = getColumn(rows, headCellIndex);

  column.sort((a, b) => {
    const sortOrder = getSortOrder(a[0], b[0]);

    return order === 'desc' ? sortOrder : -sortOrder;
  });

  return applyColumn(rows, column, headCellIndex);
}

export const getCellByColumnId = ({
  columns,
  id,
  row,
}: {
  columns: Column[];
  row: Row;
  id: Column['id'];
}) => {
  const columnId = columns.findIndex((item) => item.id === id);

  return row[columnId];
};
