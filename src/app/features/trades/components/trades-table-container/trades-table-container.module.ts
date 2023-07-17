import { NgModule } from '@angular/core';
import { TradesTableModule } from '../trades-table/trades-table.module';
import { TradesTableContainerComponent } from './trades-table-container.component';

@NgModule({
  declarations: [TradesTableContainerComponent],
  imports: [TradesTableModule],
  exports: [TradesTableContainerComponent],
})
export class TradesTableContainerModule {}
