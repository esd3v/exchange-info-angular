import { TOFIXED_DIGITS } from './config';

export const isScientific = (value: string | number) =>
  /\d+\.?\d*e[+-]*\d+/i.test(
    typeof value === 'number' ? value.toString() : value
  );

export const parsePair = (pair: string, separator: '/' | '_') => {
  const [base, quote] = pair.split(separator);

  return { base, quote };
};

export const formatLastPrice = (value: number): string | number => {
  // Also cut zeros at the end
  const number = Number(value);

  return Math.floor(value) === 0
    ? isScientific(number)
      ? value
      : number
    : number.toFixed(TOFIXED_DIGITS);
};
