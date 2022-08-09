import { NgModule } from '@angular/core';
import { PairsModule } from 'src/app/features/pairs/components/pairs/pairs.module';
import { TickerGroupModule } from 'src/app/features/tickers/components/ticker-group/ticker-group.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, PairsModule, TickerGroupModule],
  exports: [HomeComponent],
})
export class HomeModule {}
