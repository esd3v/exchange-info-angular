import { ExchangeFilters } from './exchange-filters.model';
import { ExchangeSymbol } from './exchange-symbol.model';
import { RateLimit } from './rate-limit.model';

export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  exchangeFilters: ExchangeFilters;
  symbols: ExchangeSymbol[];
}
