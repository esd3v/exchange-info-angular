import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const state = createFeatureSelector<AppState['trades']>('trades');

export const status = createSelector(state, (state) => state.status);

export const data = createSelector(state, (state) => state.data);
