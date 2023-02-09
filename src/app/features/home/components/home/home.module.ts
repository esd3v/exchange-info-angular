import { NgModule } from '@angular/core';
import { ChartModule } from 'src/app/features/candles/components/chart/chart.module';
import { OrderBookModule } from 'src/app/features/order-book/components/order-book/order-book.module';
import { PairsModule } from 'src/app/features/pairs/components/pairs/pairs.module';
import { TickerGroupModule } from 'src/app/features/ticker/components/ticker-group/ticker-group.module';
import { TradesModule } from 'src/app/features/trades/components/trades/trades.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule,
    PairsModule,
    TickerGroupModule,
    ChartModule,
    OrderBookModule,
    TradesModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
