import { TOFIXED_DIGITS } from './config';

export const isScientific = (value: string | number) =>
  /\d+\.?\d*e[+-]*\d+/i.test(
    typeof value === 'number' ? value.toString() : value
  );

export const parsePair = (pair: string, separator: '/' | '_') => {
  const [base, quote] = pair.split(separator);

  return { base, quote };
};

export const formatLastPrice = (value: string): string | number => {
  // Also cut zeros at the end
  const number = Number(value);

  if (isScientific(number)) {
    return value;
    // e.g 0.0000038 / -0.0000038
  } else if (Math.floor(number) <= 0) {
    return number;
  } else {
    return number.toFixed(TOFIXED_DIGITS);
  }
};
