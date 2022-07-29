import { createReducer, on } from '@ngrx/store';
import { parsePair } from 'src/app/shared/helpers';
import { globalActions } from '.';
import { initialState } from './global.state';

export const globalReducer = createReducer(
  initialState,
  on(globalActions.setCurrency, (state, { payload }) => ({
    ...state,
    currency: (() => {
      if (typeof payload === 'string') {
        if (payload.includes('/')) {
          return parsePair(payload, '/');
        } else if (payload.includes('_')) {
          return parsePair(payload, '_');
        } else {
          return state.currency;
        }
      } else {
        return payload;
      }
    })(),
  }))
);
