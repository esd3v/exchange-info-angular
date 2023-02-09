import { Ticker } from '../../ticker/types/ticker';

export interface PairColumn {
  id: 'pair' | keyof Pick<Ticker, 'lastPrice' | 'priceChangePercent'>;
  numeric: boolean;
  label: string;
}
