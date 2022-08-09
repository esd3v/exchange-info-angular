import { ExchangeSymbol } from '../../exchange-info/models/exchange-symbol.model';
import { Ticker } from '../../ticker/models/ticker.model';

export type PairRow = Pick<ExchangeSymbol, 'baseAsset' | 'quoteAsset'> &
  Pick<Ticker, 'priceChangePercent' | 'lastPrice'>;
