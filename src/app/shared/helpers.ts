import { Big } from 'big.js';
import { MISC_TOFIXED_DIGITS } from './config';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import { Column } from './types/column';
import { Row } from './types/row';
import { SortOrder } from './types/sort-order';
import { Currency } from './types/currency';

dayjs.extend(utc);

export const addPlusIfPositive = (value: string): string =>
  `${Number(value) > 0 ? `+${value}` : value}`;

export const isScientific = (value: string | number) =>
  /\d+\.?\d*e[+-]*\d+/i.test(
    typeof value === 'number' ? value.toString() : value
  );

export const createPair = (base: string, quote: string) => {
  return {
    underscore: `${base}_${quote}`,
    slash: `${base}/${quote}`,
    symbol: `${base}${quote}`,
  };
};

export const convertPairToCurrency = (
  pair: string,
  separator: '/' | '_'
): Currency => {
  const [base, quote] = pair.split(separator);

  return {
    base: base || null,
    quote: quote || null,
  };
};

export const formatDecimal = (value: number | string) => {
  // e.g 0.00000001 is '0.00000001' instead of 1e-8
  // also trims zeros at the end
  // e.g 0.00100000 is 0.001
  return new Big(value).toFixed();
};

export const formatPrice = (
  amount: string | number,
  stepOrTickSize: string | number
) => {
  const stepOrTickSizeFixed = formatDecimal(stepOrTickSize);
  const split = stepOrTickSizeFixed.split('.');

  const precision =
    // e.g 123456.000 === 123456 === ['123456']
    split.length <= 1
      ? 0
      : // e.g 0.00100000 === 0.001 === 001.length === 3
        split[1].length;

  return (
    Math.ceil(Number(amount) / Number(stepOrTickSize)) * Number(stepOrTickSize)
  ).toFixed(precision);
};

export const multiplyDecimal = (a: number | string, b: number | string) => {
  const da = new Big(a);
  const db = new Big(b);

  return da.times(db).toFixed();
};

export function numberWithCommas(x: string, symbol = ',') {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, symbol);
}

export const formatPriceChangePercent = (value: string) =>
  `${addPlusIfPositive(Number(value).toFixed(MISC_TOFIXED_DIGITS))}%`;

export const getFormattedDate = ({
  msec,
  utc,
  format = 'DD-MM-YYYY HH:mm:ss',
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
}): Row[] {
  type Column = [any, number][];

  // Make an array where 0 is cell of a column and 1 is cell's row index
  const getColumn = (rows: T, headCellIndex: number): Column => {
    return rows.map((row, rowIndex) => {
      const cell = row.cells[headCellIndex];

      return [cell['value'], rowIndex];
    });
  };

  const applyColumn = (rows: T, column: Column, headCellIndex: number) =>
    rows.map(({ cells, classNames }, rowIndex) => ({
      cells: cells.map((_cell, cellIndex) => {
        const originalRow = column[rowIndex][1];
        const originalCell = rows[originalRow]['cells'][cellIndex];

        const cellToReplace = {
          ...originalCell,
          value: column[rowIndex][0],
        };

        return cellIndex === headCellIndex ? cellToReplace : originalCell;
      }),
      classNames,
    }));

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

  return row.cells[columnId];
};
