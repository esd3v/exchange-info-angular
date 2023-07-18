import { NgModule } from '@angular/core';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { OrderBookTableContainerComponent } from './order-book-table-container.component';

@NgModule({
  declarations: [OrderBookTableContainerComponent],
  imports: [WindowModule, TableModule],
  exports: [OrderBookTableContainerComponent],
})
export class OrderBookTableContainerModule {}
