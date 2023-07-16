import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { TradesTableModule } from '../trades-table/trades-table.module';
import { TradesTableContainerComponent } from './trades-table-container.component';

@NgModule({
  declarations: [TradesTableContainerComponent],
  imports: [SharedModule, TradesTableModule],
  exports: [TradesTableContainerComponent],
})
export class TradesTableContainerModule {}
