import { RateLimitIntervals } from './rate-limit-intervals.model';
import { RateLimitTypes } from './rate-limit-types.model';

export interface RateLimit {
  rateLimitType: RateLimitTypes;
  interval: RateLimitIntervals;
  intervalNum: number;
  limit: number;
}
