import { NgModule } from '@angular/core';
import { OrderBookTableModule } from '../order-book-table/order-book-table.module';
import { OrderBookTableContainerComponent } from './order-book-table-container.component';

@NgModule({
  declarations: [OrderBookTableContainerComponent],
  imports: [OrderBookTableModule],
  exports: [OrderBookTableContainerComponent],
})
export class OrderBookTableContainerModule {}
