import { create } from './pairs.actions';
import { actions } from 'src/app/store';
import { createReducer, on } from '@ngrx/store';
import { initialState, PairsState } from './pairs.state';

export const pairsReducer = createReducer(
  initialState,
  on(actions.pairs.create, (state, { symbolInfo }) => ({
    ...state,
    data: [...state.data, symbolInfo],
  }))
);
