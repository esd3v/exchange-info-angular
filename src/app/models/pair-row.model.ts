import { ExchangeSymbol } from '.';
import { Ticker } from './ticker.model';

export type PairRow = Pick<ExchangeSymbol, 'baseAsset' | 'quoteAsset'> &
  Pick<Ticker, 'priceChangePercent' | 'lastPrice'>;
