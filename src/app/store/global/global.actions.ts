import { GlobalState } from './global.state';
import { createAction, props } from '@ngrx/store';

const PREFIX = '[GLOBAL]';

export const setCurrency = createAction(
  `${PREFIX} Set Currency`,
  props<{ payload: string | GlobalState['currency'] }>()
);
