import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ChartModule } from 'src/app/features/candles/components/chart/chart.module';
import { OrderBookTableContainerModule } from 'src/app/features/order-book/components/order-book-table-container/order-book-table-container.module';
import { PairsTableModule } from 'src/app/features/pairs/components/pairs-table/pairs-table.module';
import { TickerGroupModule } from 'src/app/features/ticker/components/ticker-group/ticker-group.module';
import { TradesTableModule } from 'src/app/features/trades/components/trades-table/trades-table.module';
import { HeaderModule } from 'src/app/shared/components/header/header.module';
import { HomeComponent } from './home.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    HeaderModule,
    PairsTableModule,
    TickerGroupModule,
    ChartModule,
    OrderBookTableContainerModule,
    TradesTableModule,
    MatSnackBarModule,
  ],
  exports: [HomeComponent],
})
export class HomeModule {}
