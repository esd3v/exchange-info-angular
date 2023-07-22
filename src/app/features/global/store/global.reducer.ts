import { createReducer, on } from '@ngrx/store';
import { globalActions } from '.';
import { initialState } from './global.state';

export const globalReducer = createReducer(
  initialState,
  on(globalActions.setCurrency, (state, payload) => ({
    ...state,
    currency: payload,
  }))
);
