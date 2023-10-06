import { NgModule } from '@angular/core';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { TableModule } from 'src/app/shared/table/components/table/table.module';
import { OrderBookAsksTableComponent } from './order-book-asks-table.component';

@NgModule({
  declarations: [OrderBookAsksTableComponent],
  imports: [WindowModule, TableModule],
  exports: [OrderBookAsksTableComponent],
})
export class OrderBookAsksTableModule {}
