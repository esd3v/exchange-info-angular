import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CandleChartContainerModule } from 'src/app/features/candles/components/candle-chart-container/candle-chart-container.module';
import { PairsTableModule } from 'src/app/features/pairs/components/pairs-table/pairs-table.module';
import { TickerGroupModule } from 'src/app/features/ticker/components/ticker-group/ticker-group.module';
import { TradesTableModule } from 'src/app/features/trades/components/trades-table/trades-table.module';
import { HeaderModule } from 'src/app/shared/components/header/header.module';
import { OrderBookAsksTableModule } from '../order-book/components/order-book-asks-table/order-book-asks-table.module';
import { OrderBookBidsTableModule } from '../order-book/components/order-book-bids-table/order-book-bids-table.module';
import { TradeComponent } from './trade.component';

@NgModule({
  declarations: [TradeComponent],
  imports: [
    CommonModule,
    PairsTableModule,
    TickerGroupModule,
    CandleChartContainerModule,
    TradesTableModule,
    MatSnackBarModule,
    HeaderModule,
    OrderBookAsksTableModule,
    OrderBookBidsTableModule,
  ],
  exports: [TradeComponent],
})
export class TradeModule {}
