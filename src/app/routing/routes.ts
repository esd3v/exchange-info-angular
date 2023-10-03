import { Routes } from '@angular/router';
import { TradeComponent } from 'src/app/features/trade/trade.component';
import { TradeGuard } from 'src/app/features/trade/trade.guard';
import {
  APP_DEFAULT_BASE_CURRENCY,
  APP_DEFAULT_QUOTE_CURRENCY,
} from 'src/app/shared/config';

const defaultPair = `${APP_DEFAULT_BASE_CURRENCY}_${APP_DEFAULT_QUOTE_CURRENCY}`;

export const routes: Routes = [
  {
    path: '',
    redirectTo: `trade/${defaultPair}`,
    pathMatch: 'full',
  },
  {
    path: 'trade',
    redirectTo: `trade/${defaultPair}`,
  },
  {
    path: 'trade/:pair',
    component: TradeComponent,
    canActivate: [TradeGuard],
  },
];
