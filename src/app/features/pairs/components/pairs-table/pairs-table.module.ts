import { NgModule } from '@angular/core';
import { PairsTableComponent } from './pairs-table.component';
import { WindowModule } from 'src/app/shared/components/window/window.module';
import { TableModule } from 'src/app/shared/table/components/table/table.module';

@NgModule({
  declarations: [PairsTableComponent],
  imports: [TableModule, WindowModule],
  exports: [PairsTableComponent],
})
export class PairsTableModule {}
