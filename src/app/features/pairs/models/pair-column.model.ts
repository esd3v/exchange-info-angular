import { Ticker } from '../../tickers/models/ticker.model';

export interface PairColumn {
  id: 'pair' | keyof Pick<Ticker, 'lastPrice' | 'priceChangePercent'>;
  numeric: boolean;
  label: string;
}
