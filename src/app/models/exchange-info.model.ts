import { ExchangeFilters, ExchangeSymbol, RateLimit } from '.';

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  exchangeFilters: ExchangeFilters;
  symbols: ExchangeSymbol[];
}
