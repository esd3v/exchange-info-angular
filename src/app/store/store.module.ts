import { TickerEffects } from './ticker/ticker.effects';
import { metaReducers, reducers } from './reducers';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from 'src/environments/environment';
import { ExchangeInfoEffects } from './exchangeInfo/exchangeInfo.effects';

@NgModule({
  declarations: [],
  imports: [
    EffectsModule.forRoot([TickerEffects, ExchangeInfoEffects]),
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
