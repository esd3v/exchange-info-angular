import { NgModule } from '@angular/core';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { OrderBookTablesComponent } from './order-book-tables.component';

@NgModule({
  declarations: [OrderBookTablesComponent],
  imports: [WindowModule, TableModule],
  exports: [OrderBookTablesComponent],
})
export class OrderBookTablesModule {}
