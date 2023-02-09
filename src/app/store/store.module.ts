import { TickerEffects } from '../features/ticker/store/ticker.effects';
import { metaReducers, reducers } from './reducers';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { ExchangeInfoEffects } from '../features/exchange-info/store/exchange-info.effects';
import { CandlesEffects } from '../features/candles/store/candles.effects';
import { OrderBookEffects } from '../features/order-book/store/order-book.effects';
import { TradesEffects } from '../features/trades/store/trades.effects';

@NgModule({
  declarations: [],
  imports: [
    EffectsModule.forRoot([
      TickerEffects,
      ExchangeInfoEffects,
      CandlesEffects,
      OrderBookEffects,
      TradesEffects,
    ]),
    StoreModule.forRoot(reducers, {
      metaReducers,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
})
export class AppStoreModule {}
