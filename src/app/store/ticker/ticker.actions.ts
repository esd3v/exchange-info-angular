import { TickerState } from './ticker.state';
import { createAction, props } from '@ngrx/store';
import { ParsedTicker } from 'src/app/models/parsed-ticker.model';

const PREFIX = '[TICKER]';

export const createTicker = createAction(
  `${PREFIX} Create Ticker`,
  props<{ payload: ParsedTicker }>()
);
