import { TOFIXED_DIGITS } from './config';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const addPlusIfPositive = (value: string): string =>
  `${Number(value) > 0 ? `+${value}` : value}`;

export const isScientific = (value: string | number) =>
  /\d+\.?\d*e[+-]*\d+/i.test(
    typeof value === 'number' ? value.toString() : value
  );

export const parsePair = (pair: string, separator: '/' | '_') => {
  const [base, quote] = pair.split(separator);

  return { base, quote };
};

export const formatLastPrice = (
  value: string,
  fixedDigits: number = TOFIXED_DIGITS
): string | number => {
  // Also cut zeros at the end
  const number = Number(value);

  if (isScientific(number)) {
    return value;
    // e.g 0.0000038 / -0.0000038
  } else if (Math.floor(number) <= 0) {
    return number;
  } else {
    return number.toFixed(fixedDigits);
  }
};

export const formatPriceChangePercent = (value: string) =>
  `${addPlusIfPositive(Number(value).toFixed(TOFIXED_DIGITS))}%`;

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
