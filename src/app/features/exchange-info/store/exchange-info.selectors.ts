import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from 'src/app/store';

const state = createFeatureSelector<AppState['exchangeInfo']>('exchangeInfo');

export const status = createSelector(state, (state) => state.status);
