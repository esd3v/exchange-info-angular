import { NgModule } from '@angular/core';
import { TableModule } from 'src/app/shared/components/table/table.module';
import { PairsTableComponent } from './pairs-table.component';
import { WindowModule } from 'src/app/shared/components/window/window.module';

@NgModule({
  declarations: [PairsTableComponent],
  imports: [TableModule, WindowModule],
  exports: [PairsTableComponent],
})
export class PairsTableModule {}
