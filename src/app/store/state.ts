import { TickerState } from './ticker/ticker.state';
import { GlobalState } from './global/global.state';

export type AppState = {
  global: GlobalState;
  ticker: TickerState;
};
