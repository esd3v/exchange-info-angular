import { ExchangeFilters } from './exchange-filters';
import { ExchangeSymbol } from './exchange-symbol';
import { RateLimit } from './rate-limit';

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  exchangeFilters: ExchangeFilters;
  symbols: ExchangeSymbol[];
}
