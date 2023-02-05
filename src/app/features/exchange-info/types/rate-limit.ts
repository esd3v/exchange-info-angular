import { RateLimitIntervals } from './rate-limit-intervals';
import { RateLimitTypes } from './rate-limit-types';

export interface RateLimit {
  rateLimitType: RateLimitTypes;
  interval: RateLimitIntervals;
  intervalNum: number;
  limit: number;
}
