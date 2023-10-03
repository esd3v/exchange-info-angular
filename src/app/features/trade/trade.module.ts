import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CandleChartContainerModule } from 'src/app/features/candles/components/candle-chart-container/candle-chart-container.module';
import { OrderBookTablesModule } from 'src/app/features/order-book/components/order-book-tables/order-book-tables.module';
import { PairsTableModule } from 'src/app/features/pairs/components/pairs-table/pairs-table.module';
import { TickerGroupModule } from 'src/app/features/ticker/components/ticker-group/ticker-group.module';
import { TradesTableModule } from 'src/app/features/trades/components/trades-table/trades-table.module';
import { HeaderModule } from 'src/app/shared/components/header/header.module';
import { TradeComponent } from './trade.component';

@NgModule({
  declarations: [TradeComponent],
  imports: [
    PairsTableModule,
    TickerGroupModule,
    CandleChartContainerModule,
    OrderBookTablesModule,
    TradesTableModule,
    MatSnackBarModule,
    HeaderModule,
  ],
  exports: [TradeComponent],
})
export class TradeModule {}
