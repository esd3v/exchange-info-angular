import { actions } from 'src/app/store';
import { createReducer, on } from '@ngrx/store';
import { parsePair } from 'src/app/helpers';
import { initialState } from './global.state';

export const globalReducer = createReducer(
  initialState,
  on(actions.global.setCurrency, (state, { payload }) => ({
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
