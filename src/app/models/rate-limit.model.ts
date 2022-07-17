import { RateLimitIntervals, RateLimitTypes } from '.';

export interface RateLimit {
  rateLimitType: RateLimitTypes;
  interval: RateLimitIntervals;
  intervalNum: number;
  limit: number;
}
