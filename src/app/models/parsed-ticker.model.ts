import { Ticker } from './ticker.model';

export interface ParsedTicker {
  symbol: string;
  lastPrice: Ticker['lastPrice'];
  lastQuantity: Ticker['lastQty'];
  priceChange: Ticker['priceChange'];
  priceChangePercent: Ticker['priceChangePercent'];
  numberOfTrades: Ticker['count'];
}
