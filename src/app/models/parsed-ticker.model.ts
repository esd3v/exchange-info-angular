export interface ParsedTicker {
  symbol: string;
  lastPrice: number;
  lastQuantity: number;
  priceChange: number;
  priceChangePercent: number;
  numberOfTrades: number;
}
