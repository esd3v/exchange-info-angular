import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChartModule } from 'src/app/features/candles/components/chart/chart.module';
import { OrderBookTableContainerModule } from 'src/app/features/order-book/components/order-book-table-container/order-book-table-container.module';
import { PairsModule } from 'src/app/features/pairs/components/pairs/pairs.module';
import { TickerGroupModule } from 'src/app/features/ticker/components/ticker-group/ticker-group.module';
import { TradesTableContainerModule } from 'src/app/features/trades/components/trades-table-container/trades-table-container.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule,
    PairsModule,
    TickerGroupModule,
    ChartModule,
    OrderBookTableContainerModule,
    TradesTableContainerModule,
    MatSnackBarModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
