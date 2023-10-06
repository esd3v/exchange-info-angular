import { NgModule } from '@angular/core';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { TableModule } from 'src/app/shared/table/components/table/table.module';
import { OrderBookBidsTableComponent } from './order-book-bids-table.component';

@NgModule({
  declarations: [OrderBookBidsTableComponent],
  imports: [WindowModule, TableModule],
  exports: [OrderBookBidsTableComponent],
})
export class OrderBookBidsTableModule {}
