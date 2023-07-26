import { NgModule } from '@angular/core';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { OrderBookTablesComponent } from './order-book-tables.component';
import { TableModule } from 'src/app/shared/table/components/table/table.module';

@NgModule({
  declarations: [OrderBookTablesComponent],
  imports: [WindowModule, TableModule],
  exports: [OrderBookTablesComponent],
})
export class OrderBookTablesModule {}
